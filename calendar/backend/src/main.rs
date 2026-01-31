use serde::{Deserialize, Serialize};
use chrono::{Utc, Datelike, NaiveDate};
use warp::Filter;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct CalendarRequest {
    year: i32,
    month: u32,
}

#[derive(Debug, Serialize)]
struct CalendarResponse {
    year: i32,
    month: u32,
    days: Vec<DayInfo>,
    lunar_year: String,
    zodiac: String,
}

#[derive(Debug, Serialize)]
struct DayInfo {
    day: u32,
    weekday: String,
    weekday_num: u32,
    lunar_day: String,
    lunar_month: String,
    is_today: bool,
    is_weekend: bool,
}

#[derive(Debug, Serialize)]
struct LunarDateResponse {
    solar_date: String,
    lunar_date: String,
    lunar_year: String,
    lunar_month: String,
    lunar_day: String,
    zodiac: String,
    stem_branch: String,
}

// 农历数据表（1900-2100年的农历信息，使用压缩格式）
// 每个年份用16位表示：12位表示每月天数（大月30天，小月29天）+ 4位表示闰月信息
const LUNAR_DATA: [u64; 201] = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520,
];

const LUNAR_MONTH_NAMES: [&str; 12] = [
    "正月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "冬月", "腊月"
];

const LUNAR_DAY_NAMES: [&str; 30] = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

const ZODIAC_ANIMALS: [&str; 12] = [
    "鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"
];

const HEAVENLY_STEMS: [&str; 10] = [
    "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"
];

const EARTHLY_BRANCHES: [&str; 12] = [
    "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"
];

const WEEKDAY_NAMES: [&str; 7] = ["日", "一", "二", "三", "四", "五", "六"];

// 计算农历日期
fn calculate_lunar_date(year: i32, month: u32, day: u32) -> (String, String, String, String, String, String) {
    // 简化版农历计算 - 使用查表法
    let base_date = NaiveDate::from_ymd_opt(1900, 1, 31).unwrap();
    let target_date = NaiveDate::from_ymd_opt(year, month, day).unwrap();
    
    let days_since_base = target_date.signed_duration_since(base_date).num_days() as usize;
    
    let mut lunar_year = 1900;
    let mut remaining_days = days_since_base;
    
    // 查找对应的农历年份
    for i in 0..LUNAR_DATA.len() {
        let year_days = get_lunar_year_days(i);
        if remaining_days < year_days {
            lunar_year = 1900 + i as i32;
            break;
        }
        remaining_days -= year_days;
    }
    
    // 计算月日
    let (lunar_month, lunar_day, is_leap) = calculate_lunar_month_day(lunar_year, remaining_days);
    
    // 获取干支和生肖
    let stem_branch = get_stem_branch_year(lunar_year);
    let zodiac = get_zodiac_animal(lunar_year);
    
    let lunar_month_str = if is_leap {
        format!("闰{}", LUNAR_MONTH_NAMES[lunar_month - 1])
    } else {
        LUNAR_MONTH_NAMES[lunar_month - 1].to_string()
    };
    
    let lunar_day_str = LUNAR_DAY_NAMES[lunar_day - 1].to_string();
    let lunar_date_str = format!("{}{}", lunar_month_str, lunar_day_str);
    
    (lunar_date_str, lunar_month_str, lunar_day_str, format!("{}年", stem_branch), stem_branch, zodiac)
}

fn get_lunar_year_days(index: usize) -> usize {
    let data = LUNAR_DATA[index];
    let mut days = 0;
    
    // 判断是否有闰月
    let leap_month = (data >> 16) & 0x0f;
    
    for i in 0..12 {
        let month_days = if (data >> i) & 0x01 == 1 { 30 } else { 29 };
        days += month_days;
    }
    
    // 加上闰月天数
    if leap_month > 0 {
        let leap_days = if (data >> 12) & 0x01 == 1 { 30 } else { 29 };
        days += leap_days;
    }
    
    days
}

fn calculate_lunar_month_day(lunar_year: i32, days: usize) -> (usize, usize, bool) {
    let index = (lunar_year - 1900) as usize;
    let data = LUNAR_DATA[index];
    
    let mut remaining = days;
    let leap_month = ((data >> 16) & 0x0f) as usize;
    
    for month in 0..12 {
        let month_days = if (data >> month) & 0x01 == 1 { 30 } else { 29 };
        
        if remaining < month_days {
            return (month + 1, remaining + 1, false);
        }
        remaining -= month_days;
        
        // 检查是否是闰月
        if leap_month == month + 1 {
            let leap_days = if (data >> 12) & 0x01 == 1 { 30 } else { 29 };
            if remaining < leap_days {
                return (month + 1, remaining + 1, true);
            }
            remaining -= leap_days;
        }
    }
    
    (12, remaining + 1, false)
}

fn get_stem_branch_year(year: i32) -> String {
    let offset = (year - 1900) as usize;
    let stem = HEAVENLY_STEMS[offset % 10];
    let branch = EARTHLY_BRANCHES[offset % 12];
    format!("{}{}", stem, branch)
}

fn get_zodiac_animal(year: i32) -> String {
    let offset = (year - 1900) as usize;
    ZODIAC_ANIMALS[offset % 12].to_string()
}

fn generate_calendar(year: i32, month: u32) -> CalendarResponse {
    let first_day = NaiveDate::from_ymd_opt(year, month, 1).unwrap();
    let weekday = first_day.weekday().num_days_from_sunday();
    
    // 计算当月天数
    let next_month = if month == 12 {
        NaiveDate::from_ymd_opt(year + 1, 1, 1).unwrap()
    } else {
        NaiveDate::from_ymd_opt(year, month + 1, 1).unwrap()
    };
    let days_in_month = next_month.signed_duration_since(first_day).num_days() as u32;
    
    // 获取今天的日期
    let today = Utc::now().date_naive();
    
    let mut days = Vec::new();
    
    // 添加上月的日期（用于补齐日历）
    if weekday > 0 {
        let prev_month = if month == 1 {
            NaiveDate::from_ymd_opt(year - 1, 12, 1).unwrap()
        } else {
            NaiveDate::from_ymd_opt(year, month - 1, 1).unwrap()
        };
        
        let prev_month_days = first_day.signed_duration_since(prev_month).num_days() as u32;
        
        for i in (0..weekday).rev() {
            let prev_day = prev_month_days - i as u32;
            let (_lunar_date, lunar_month, lunar_day, _, _, _) = calculate_lunar_date(
                if month == 1 { year - 1 } else { year },
                if month == 1 { 12 } else { month - 1 },
                prev_day
            );
            
            days.push(DayInfo {
                day: prev_day,
                weekday: String::new(),
                weekday_num: 0,
                lunar_day: lunar_day,
                lunar_month: lunar_month,
                is_today: false,
                is_weekend: false,
            });
        }
    }
    
    // 添加当月日期
    for day in 1..=days_in_month {
        let current_date = NaiveDate::from_ymd_opt(year, month, day).unwrap();
        let current_weekday = current_date.weekday();
        let weekday_num = current_weekday.num_days_from_sunday();
        
        let (_lunar_date, lunar_month, lunar_day, _, _, _) = calculate_lunar_date(year, month, day);
        
        let is_today = current_date == today;
        let is_weekend = weekday_num == 0 || weekday_num == 6;
        
        days.push(DayInfo {
            day,
            weekday: WEEKDAY_NAMES[weekday_num as usize].to_string(),
            weekday_num,
            lunar_day,
            lunar_month,
            is_today,
            is_weekend,
        });
    }
    
    // 添加下月的日期（补齐到6行或5行）
    let total_cells = days.len();
    let remaining_cells = if total_cells <= 35 { 35 - total_cells } else { 42 - total_cells };
    
    for day in 1..=remaining_cells {
        let (_lunar_date, lunar_month, lunar_day, _, _, _) = calculate_lunar_date(
            if month == 12 { year + 1 } else { year },
            if month == 12 { 1 } else { month + 1 },
            day as u32
        );
        
        days.push(DayInfo {
            day: day as u32,
            weekday: String::new(),
            weekday_num: 0,
            lunar_day,
            lunar_month,
            is_today: false,
            is_weekend: false,
        });
    }
    
    let (_, _, _, lunar_year_name, _, zodiac) = calculate_lunar_date(year, month, 1);
    
    CalendarResponse {
        year,
        month,
        days,
        lunar_year: lunar_year_name,
        zodiac: format!("{}年", zodiac),
    }
}

#[tokio::main]
async fn main() {
    let calendar_route = warp::path("calendar")
        .and(warp::get())
        .and(warp::query::<CalendarRequest>())
        .map(|request: CalendarRequest| {
            let calendar = generate_calendar(request.year, request.month);
            warp::reply::json(&calendar)
        });
    
    let lunar_route = warp::path("lunar")
        .and(warp::get())
        .and(warp::query::<HashMap<String, String>>())
        .map(|params: HashMap<String, String>| {
            let year = params.get("year").and_then(|s| s.parse::<i32>().ok()).unwrap_or(2024);
            let month = params.get("month").and_then(|s| s.parse::<u32>().ok()).unwrap_or(1);
            let day = params.get("day").and_then(|s| s.parse::<u32>().ok()).unwrap_or(1);
            
            let (lunar_date, lunar_month, lunar_day, lunar_year, stem_branch, zodiac) = 
                calculate_lunar_date(year, month, day);
            
            let response = LunarDateResponse {
                solar_date: format!("{}-{:02}-{:02}", year, month, day),
                lunar_date,
                lunar_year,
                lunar_month,
                lunar_day,
                zodiac: format!("{}年", zodiac),
                stem_branch,
            };
            
            warp::reply::json(&response)
        });
    
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["GET", "POST"]);
    
    let routes = calendar_route.or(lunar_route).with(cors);
    
    println!("Calendar server running on http://localhost:3031");
    warp::serve(routes).run(([127, 0, 0, 1], 3031)).await;
}
