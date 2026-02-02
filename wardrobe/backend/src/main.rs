use lazy_static::lazy_static;
use std::sync::Mutex;
use warp::Filter;
use uuid::Uuid;
use serde_json::json;

mod models;
use models::*;

lazy_static! {
    static ref WARDROBE: Mutex<Wardrobe> = Mutex::new(Wardrobe::new());
}

fn get_wardrobe() -> &'static Mutex<Wardrobe> {
    &WARDROBE
}

#[tokio::main]
async fn main() {
    let api = warp::path("api");
    
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"]);

    let get_all_clothes = api
        .and(warp::path("clothes"))
        .and(warp::get())
        .and(warp::path::end())
        .map(|| {
            let wardrobe = get_wardrobe().lock().unwrap();
            let clothes = wardrobe.get_all_clothes();
            warp::reply::json(&clothes)
        });

    let get_clothing_by_id = api
        .and(warp::path("clothes"))
        .and(warp::path::param::<String>())
        .and(warp::get())
        .and(warp::path::end())
        .map(|id_str: String| {
            match Uuid::parse_str(&id_str) {
                Ok(uuid) => {
                    let wardrobe = get_wardrobe().lock().unwrap();
                    match wardrobe.get_clothing_by_id(uuid) {
                        Some(clothing) => warp::reply::json(&clothing),
                        None => warp::reply::json(&json!({"error": "Clothing not found"})),
                    }
                }
                Err(_) => warp::reply::json(&json!({"error": "Invalid UUID"})),
            }
        });

    let add_clothing = api
        .and(warp::path("clothes"))
        .and(warp::post())
        .and(warp::path::end())
        .and(warp::body::json())
        .map(|new_clothing: NewClothing| {
            let mut wardrobe = get_wardrobe().lock().unwrap();
            let clothing = wardrobe.add_clothing(new_clothing);
            warp::reply::json(&clothing)
        });

    let update_clothing = api
        .and(warp::path("clothes"))
        .and(warp::path::param::<String>())
        .and(warp::put())
        .and(warp::path::end())
        .and(warp::body::json())
        .map(|id_str: String, updates: UpdateClothing| {
            match Uuid::parse_str(&id_str) {
                Ok(uuid) => {
                    let mut wardrobe = get_wardrobe().lock().unwrap();
                    match wardrobe.update_clothing(uuid, updates) {
                        Some(clothing) => warp::reply::json(&clothing),
                        None => warp::reply::json(&json!({"error": "Clothing not found"})),
                    }
                }
                Err(_) => warp::reply::json(&json!({"error": "Invalid UUID"})),
            }
        });

    let delete_clothing = api
        .and(warp::path("clothes"))
        .and(warp::path::param::<String>())
        .and(warp::delete())
        .and(warp::path::end())
        .map(|id_str: String| {
            match Uuid::parse_str(&id_str) {
                Ok(uuid) => {
                    let mut wardrobe = get_wardrobe().lock().unwrap();
                    if wardrobe.delete_clothing(uuid) {
                        warp::reply::json(&json!({"message": "Clothing deleted"}))
                    } else {
                        warp::reply::json(&json!({"error": "Clothing not found"}))
                    }
                }
                Err(_) => warp::reply::json(&json!({"error": "Invalid UUID"})),
            }
        });

    let get_clothes_by_season = api
        .and(warp::path("clothes"))
        .and(warp::path("season"))
        .and(warp::path::param::<String>())
        .and(warp::get())
        .and(warp::path::end())
        .map(|season_str: String| {
            match season_str.as_str() {
                "spring-autumn" | "summer" | "winter" => {
                    let season = match season_str.as_str() {
                        "spring-autumn" => Season::SpringAutumn,
                        "summer" => Season::Summer,
                        "winter" => Season::Winter,
                        _ => unreachable!(),
                    };
                    let wardrobe = get_wardrobe().lock().unwrap();
                    let clothes = wardrobe.get_clothes_by_season(season);
                    warp::reply::json(&clothes)
                }
                _ => warp::reply::json(&json!({"error": "Invalid season"})),
            }
        });

    let get_clothes_by_type = api
        .and(warp::path("clothes"))
        .and(warp::path("type"))
        .and(warp::path::param::<String>())
        .and(warp::get())
        .and(warp::path::end())
        .map(|type_str: String| {
            match type_str.as_str() {
                "top" | "bottom" | "dress" | "outerwear" => {
                    let clothing_type = match type_str.as_str() {
                        "top" => ClothingType::Top,
                        "bottom" => ClothingType::Bottom,
                        "dress" => ClothingType::Dress,
                        "outerwear" => ClothingType::Outerwear,
                        _ => unreachable!(),
                    };
                    let wardrobe = get_wardrobe().lock().unwrap();
                    let clothes = wardrobe.get_clothes_by_type(clothing_type);
                    warp::reply::json(&clothes)
                }
                _ => warp::reply::json(&json!({"error": "Invalid clothing type"})),
            }
        });

    let static_files = warp::path("static")
        .and(warp::fs::dir("./frontend/static"));

    let index = warp::path::end()
        .and(warp::get())
        .map(|| {
            warp::reply::html(include_str!("../../frontend/index.html"))
        });

    let routes = index
        .or(static_files)
        .or(get_all_clothes)
        .or(get_clothing_by_id)
        .or(add_clothing)
        .or(update_clothing)
        .or(delete_clothing)
        .or(get_clothes_by_season)
        .or(get_clothes_by_type)
        .with(cors);

    println!("Server running on http://192.168.3.176:3030");
    warp::serve(routes)
        .run(([0, 0, 0, 0], 3030))
        .await;
}