use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use warp::Filter;

#[derive(Debug, Deserialize)]
struct CalculationRequest {
    expression: String,
}

#[derive(Debug, Serialize)]
struct CalculationResponse {
    result: f64,
    error: Option<String>,
}

fn evaluate_expression(expr: &str) -> Result<f64, String> {
    let tokens: Vec<&str> = expr.split_whitespace().collect();
    if tokens.len() != 3 {
        return Err("Invalid expression format. Expected: 'number operator number'".to_string());
    }

    let a: f64 = tokens[0].parse()
        .map_err(|_| "Invalid first number".to_string())?;
    let b: f64 = tokens[2].parse()
        .map_err(|_| "Invalid second number".to_string())?;

    let result = match tokens[1] {
        "+" => a + b,
        "-" => a - b,
        "*" => a * b,
        "/" => {
            if b == 0.0 {
                return Err("Division by zero".to_string());
            }
            a / b
        },
        _ => return Err("Invalid operator. Use +, -, *, /".to_string()),
    };

    Ok(result)
}

#[tokio::main]
async fn main() {
    let calculate = warp::path("calculate")
        .and(warp::post())
        .and(warp::body::json())
        .map(|request: CalculationRequest| {
            let response = match evaluate_expression(&request.expression) {
                Ok(result) => CalculationResponse {
                    result,
                    error: None,
                },
                Err(error) => CalculationResponse {
                    result: 0.0,
                    error: Some(error),
                },
            };
            warp::reply::json(&response)
        });

    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["POST"]);

    let routes = calculate.with(cors);

    println!("Calculator server running on http://localhost:3030");
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}