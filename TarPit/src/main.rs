use fastly::{Request, Response};
use std::io::Write;
use std::{thread, time};
use chrono::prelude::*;

fn main() {
    let req = Request::from_client();

    if(req.get_path() == "/") {
        let mut resp = Response::from_status(200);
        resp.set_header("Content-Type", "text/html");
        resp.set_body("<html><head><title>Tarpit Example</title></head><body><h1>Fastly Rust</h1><script src='http://localhost:7676/app.js'></script></body></html>");
        resp.send_to_client();
        return;
    }


    let mut resp = Response::from_body("");

    resp.set_header("set-cookie", "fastly-test=123; path=/; expires=Thu, 01 Jan 2023 00:00:00 GMT");
    resp.set_header("Content-Type", "application/javascript");

    // resp.send_to_client();

    let mut stream = resp.stream_to_client();

    for _ in 0..5 {
        thread::sleep(time::Duration::from_millis(1000));

        let date = Utc::now().format("%Y-%m-%d %H:%M:%S");

        stream.write_str(format!("Hello from {}! \n", date).as_str());
        stream.flush().unwrap();
    }
}
