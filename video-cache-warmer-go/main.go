package main

import (
	"bufio"
	"context"
	"fmt"
	"github.com/fastly/compute-sdk-go/fsthttp"
	"github.com/grafov/m3u8"
	"io"
	"io/ioutil"
	"log"
	"strings"
	"sync"
)

const VideoBackend = "ShastaRain_backend"

func sendMediaRequest(ctx context.Context, base_url string, ts_url string, wg *sync.WaitGroup) {
	defer wg.Done()
	media_url := fmt.Sprintf("%s%s", base_url, ts_url)
	req, err := fsthttp.NewRequest("HEAD", media_url, nil)
	if err != nil {
		// If we failed log it an move on.
		log.Printf("%s: create request: %v", media_url, err)
	} else {
		// req.Header.Add("foo", "bar")
		// We don't care about the return value from the send.
		req.Send(ctx, VideoBackend)
	}
}

func main() {
	fsthttp.ServeFunc(func(ctx context.Context, w fsthttp.ResponseWriter, r *fsthttp.Request) {
		// Filter requests that have unexpected methods.
		if r.Method != "HEAD" && r.Method != "GET" {
			w.WriteHeader(fsthttp.StatusMethodNotAllowed)
			fmt.Fprintf(w, "This method is not allowed\n")
			return
		}

		resp, err := r.Send(ctx, VideoBackend)
		if err != nil {
			w.WriteHeader(fsthttp.StatusBadGateway)
			fmt.Fprintln(w, err.Error())
			return
		}
		// Copy the headers from the be response to the client response writer.
		w.Header().Reset(resp.Header)
		// Only process HLS manifests.
		if strings.HasSuffix(r.URL.Path, ".m3u8") {
			// r.Body = ioutil.NopCloser(io.TeeReader(r.Body, &body))
			// resp.Body = ioutil.NopCloser(io.TeeReader(resp.Body, &body))
			resp.Body = ioutil.NopCloser(io.TeeReader(resp.Body, w))
			p, listType, err := m3u8.DecodeFrom(bufio.NewReader(resp.Body), true)
			if err != nil {
				panic(err)
			}
			switch listType {
			case m3u8.MEDIA:
				mediapl := p.(*m3u8.MediaPlaylist)
				// The media urls in the manifest will be relative so we need to save the base url to prepend it.
				// That path will include the manifest file name so we need to cut that off with a litte bit of
				// string manipulation.
				// /path/to/vidoe/
				s := strings.Split(r.URL.Path, "/")
				t := strings.Join(s[:len(s)-1], "/")
				base_url := fmt.Sprintf("%s://%s%s/", r.URL.Scheme, r.URL.Host, t)
				var wg sync.WaitGroup
				for _, seggy := range mediapl.Segments[:5] {
					wg.Add(1)
					go sendMediaRequest(ctx, base_url, seggy.URI, &wg)
				}
				wg.Wait()

			case m3u8.MASTER:
				// masterpl := p.(*m3u8.MasterPlaylist)
				// fmt.Printf("%+v\n", masterpl)
				fmt.Printf("Master manifest.")
			}
			// io.Copy(w, resp.Body)
			return
		} else {
			// If we are not processing an m3u8 let it pass through.
			io.Copy(w, resp.Body)
			return
		}
	})
}
