use fastly::http::{header};
use fastly::{panic_with_status, Request, Response, Dictionary};
use fastly_kv_preview::object_store::ObjectStore;

fn main() {
    /**
     * Open dictionary containing configuration
     */
    let config = Dictionary::open("config");

    // Get ObjectStore name
    let object_store_name = config.get("store_name").unwrap();

    // Attempt to open the store
    let object_store = match ObjectStore::open(&object_store_name).unwrap_or_else(|e| {
        panic_with_status!(501, e.to_string());
    }) {
        // open an existing object store
        Some(store) => store,
        // ...or panic if it doesn't exist
        None => panic_with_status!(501, "Store {} not found!", object_store_name),
    };

    // Get client request
    let req = Request::from_client();

    // Use the path from the url as the key for the object store
    let mut key = req.get_path().to_owned();

    // If the path is empty or route, use the "index path" from the config
    // An example would be `index.html`
    if key == "" || key == "/" {
        key = config.get("index_path").unwrap();
    }

    // Keys in the object store can not contain periods.
    let object_key = key.replace(".", "dot");

    // Attempt to get the object from the store
    let read_val = match object_store.lookup_str(&object_key).unwrap() {
        Some(entry) => {
            entry
        }
        None => {
            "Not Found".to_string()
        }
    };

    // Create a response and set the body to the value from the object store
    let mut res = Response::from_body(read_val);

    // Set the content type header based on the extension of the key, e.g. "logo.png" is a png file.
    res.set_header(
        header::CONTENT_TYPE,
        mime_guess::from_path(key)
            .first_raw()
            .unwrap_or("binary/octet-stream"),
    );

    // Send the response back to the client
    res.send_to_client();
}