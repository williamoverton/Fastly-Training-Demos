use fastly::experimental::RequestUpgradeWebsocket;
use fastly::http::{header, Method, StatusCode};
use fastly::{mime, Dictionary, Error, Request, Response};
use handlebars::Handlebars;
use serde::Deserialize;
use std::collections::HashMap;
use serde_json::json;

const FANOUT_BACKEND: &str = "fanout_backend";

const DEFAULT_CHANNEL: &str = "test";

const VIDEO_CHANNEL: &str = "video";

const CONFIG_NAME: &str = "fanout config";

const PRIMARY_VIDEO: &str = "https://www.shastarain.com/videos/buck/buck.m3u8";
const PRIMARY_POSTER: &str = "https://www.shastarain.com/videos/buck/buck.png";
const SECONDARY_VIDEO: &str = "https://www.shastarain.com/videos/tearsofsteel/tearsofsteel.m3u8";
const SECONDARY_POSTER: &str = "https://www.shastarain.com/videos/tearsofsteel/tearsofsteel.png";

#[derive(Deserialize, Debug)]
struct PublishForm {
    channel: String,
    msg: String,
}

fn handle_root(_req: Request) -> Response {
    Response::from_status(StatusCode::OK)
        .with_header("Content-Type", "text/plain")
        .with_body("Hello from the Fanout test handler!\n")
}

fn handle_long_poll(_req: Request) -> Response {
    Response::from_status(StatusCode::OK)
        .with_header("Content-Type", "text/plain")
        .with_header("Grip-Hold", "response")
        .with_header("Grip-Channel", DEFAULT_CHANNEL)
        .with_body("no data\n")
}

fn handle_stream(_req: Request) -> Response {
    Response::from_status(StatusCode::OK)
        .with_header("Content-Type", "text/plain")
        .with_header("Grip-Hold", "stream")
        .with_header("Grip-Channel", DEFAULT_CHANNEL)
        .with_body("stream open\n")
}

fn handle_sse(_req: Request) -> Response {
    Response::from_status(StatusCode::OK)
        .with_header("Content-Type", "text/event-stream")
        .with_header("Grip-Hold", "stream")
        .with_header("Grip-Channel", DEFAULT_CHANNEL)
        .with_body("event: message\ndata: stream open\n\n")
}

fn handle_ws(mut req: Request) -> Response {
    let content_type = match req.get_header_str("Content-Type") {
        Some(s) => s,
        None => {
            return Response::from_status(StatusCode::BAD_REQUEST).with_body("Need Content-Type.\n")
        }
    };

    if content_type != "application/websocket-events" {
        return Response::from_status(StatusCode::BAD_REQUEST)
            .with_body("Not a WebSocket-over-HTTP request.\n");
    }

    let body = req.take_body().into_bytes();

    let mut sub = false;

    if body.len() >= 6 && &body[..6] == b"OPEN\r\n" {
        sub = true;
    }

    // echo
    let mut out_body = body.clone();

    if sub {
        let chan = match req.get_query_parameter("channel") {
            Some(value) => value,
            _ => DEFAULT_CHANNEL,
        };
        let msg = format!("c:{{\"type\":\"subscribe\",\"channel\":\"{}\"}}", chan);
        out_body.extend(format!("TEXT {:02x}\r\n{}\r\n", msg.len(), msg).as_bytes());
        let ka = "c:{\"type\": \"keep-alive\", \"content\": \"{}\", \"timeout\": 30}";
        out_body.extend(format!("TEXT {:02x}\r\n{}\r\n", ka.len(), ka).as_bytes());
        println!("Out body: {:?}", out_body);
    } else {
        out_body.extend(format!(" Off").as_bytes());
    }

    let mut resp = Response::from_status(StatusCode::OK)
        .with_header("Content-Type", "application/websocket-events");

    if sub {
        resp.set_header("Sec-WebSocket-Extensions", "grip; message-prefix=\"\"");
    }

    resp.set_body(out_body);

    resp
}

fn handle(req: Request) -> Result<Response, Error> {
    let path = req.get_url().path();
    println!("In handle: path={:?}", path);

    match path {
        "/" => Ok(handle_root(req)),
        "/response" => Ok(handle_long_poll(req)),
        "/stream" => Ok(handle_stream(req)),
        "/sse" => Ok(handle_sse(req)),
        "/ws" => Ok(handle_ws(req)),
        _ => Ok(Response::from_status(StatusCode::NOT_FOUND).with_body("no such test resource\n")),
    }
}

fn fanout_publish(channel: &str, msg: &str) {
    let sid = std::env::var("FASTLY_SERVICE_ID").unwrap_or_else(|_| String::new());
    let secret = Dictionary::open(CONFIG_NAME).get("secret").unwrap();
    let auth_basic = format!("Basic {}", base64::encode(format!("{}:{}", sid, secret)));
    // JMR - It's easy enough to create the JSON string for this case but if it gets more complex
    // I should use serde.
    let json_msg = format!("{{\"items\":[{{\"channel\":\"{}\",\"formats\":{{\"ws-message\":{{\"content\":\"{}\"}}}}}}]}}", channel, msg);
    let url = format!("https://fanout.fastly.com/{}/publish/", sid);
    let fanout_resp = Request::post(url)
        .with_header(header::AUTHORIZATION, auth_basic)
        .with_body(json_msg)
        .send(FANOUT_BACKEND)
        .unwrap();
    println!("Response from fanout: {:?}", fanout_resp.get_status());
}

fn main() -> Result<(), Error> {
    let mut req = Request::from_client();
    let qp = req.get_url_str();
    println!("Entering main - url: {}", qp);
    // let req_bod = req.take_body_str();
    // println!("Body: {}", req_bod);

    if req.get_header_str("Grip-Sig").is_some() {
        // if the request came from Fanout, process it normally
        // req.with_body(req_bod);
        Ok(handle(req)?.send_to_client())
    } else {
        // otherwise, tell the subsystem that the request should be routed
        // through Fanout first
        match req.get_path() {
            "/video" => {
                let raw_html = include_str!("ws_video.html");
                let reg = Handlebars::new();
                let data = HashMap::from([
                    ("channel", VIDEO_CHANNEL),
                    ("primary_video", PRIMARY_VIDEO),
                    ("primary_poster", PRIMARY_POSTER),
                    ("secondary_video", SECONDARY_VIDEO),
                    ("secondary_poster", SECONDARY_POSTER),
                ]);
                // New handlebars
                let video_body = reg.render_template(raw_html, &json!(data))?;
                return Ok(Response::from_status(StatusCode::OK)
                    .with_content_type(mime::TEXT_HTML_UTF_8)
                    .with_body(video_body)
                    .send_to_client());
            }
            "/subscribe" => {
                let chan = match req.get_query_parameter("channel") {
                    Some(value) => value,
                    _ => DEFAULT_CHANNEL,
                };
                let raw_html = include_str!("ws_subscribe.html");
                let reg = Handlebars::new();
                // New handlebars
                let subscribe_body = reg.render_template(raw_html, &json!({ "channel": chan }))?;
                return Ok(Response::from_status(StatusCode::OK)
                    .with_content_type(mime::TEXT_HTML_UTF_8)
                    .with_body(subscribe_body)
                    .send_to_client());
            }
            "/publish" => match req.get_method() {
                &Method::GET => {
                    let raw_html = include_str!("ws_publish.html");
                    let reg = Handlebars::new();
                    let publish_body =
                        reg.render_template(raw_html, &json!({ "channel": DEFAULT_CHANNEL }))?;
                    return Ok(Response::from_status(StatusCode::OK)
                        .with_content_type(mime::TEXT_HTML_UTF_8)
                        .with_body(publish_body)
                        .send_to_client());
                }
                &Method::POST => {
                    let publish_form = req.take_body_form::<PublishForm>().unwrap();
                    println!("Body: {:?}", publish_form);
                    fanout_publish(&publish_form.channel, &publish_form.msg);

                    let raw_html = include_str!("ws_publish.html");
                    let reg = Handlebars::new();
                    let publish_body =
                        reg.render_template(raw_html, &json!({ "channel": publish_form.channel }))?;

                    return Ok(Response::from_status(StatusCode::OK)
                        .with_content_type(mime::TEXT_HTML_UTF_8)
                        .with_body(publish_body)
                        .send_to_client());
                }
                _ => {
                    return Ok(Response::from_status(StatusCode::BAD_REQUEST)
                        .with_body("Method not supported.\n")
                        .send_to_client());
                }
            },
            _ => {
                if req.get_body_mut().read_chunks(1).next().is_some() {
                    return Ok(Response::from_status(StatusCode::BAD_REQUEST)
                        .with_body("Request body must be empty.\n")
                        .send_to_client());
                }

                println!("Upgrading the websocket!");
                // despite the name, this function works for both http requests and
                // websockets. we plan to update the SDK to make this more intuitive
                Ok(req.upgrade_websocket("jr-ws-play")?)
            }
        }
    }
}
