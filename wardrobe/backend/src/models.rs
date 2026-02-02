use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clothing {
    pub id: Uuid,
    pub label: String,
    pub clothing_type: ClothingType,
    pub season: Season,
    pub wear_count: u32,
    pub purchase_date: DateTime<Utc>,
    pub image_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ClothingType {
    Top,
    Bottom,
    Dress,
    Outerwear,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Season {
    SpringAutumn,
    Summer,
    Winter,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewClothing {
    pub label: String,
    pub clothing_type: ClothingType,
    pub season: Season,
    pub wear_count: Option<u32>,
    pub purchase_date: Option<DateTime<Utc>>,
    pub image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateClothing {
    pub label: Option<String>,
    pub clothing_type: Option<ClothingType>,
    pub season: Option<Season>,
    pub wear_count: Option<u32>,
    pub image_url: Option<String>,
}

pub struct Wardrobe {
    clothes: HashMap<Uuid, Clothing>,
}

impl Wardrobe {
    pub fn new() -> Self {
        Self {
            clothes: HashMap::new(),
        }
    }

    pub fn add_clothing(&mut self, new_clothing: NewClothing) -> Clothing {
        let id = Uuid::new_v4();
        let clothing = Clothing {
            id,
            label: new_clothing.label,
            clothing_type: new_clothing.clothing_type,
            season: new_clothing.season,
            wear_count: new_clothing.wear_count.unwrap_or(0),
            purchase_date: new_clothing.purchase_date.unwrap_or_else(|| Utc::now()),
            image_url: new_clothing.image_url,
        };

        self.clothes.insert(id, clothing.clone());
        clothing
    }

    pub fn get_all_clothes(&self) -> Vec<Clothing> {
        self.clothes.values().cloned().collect()
    }

    pub fn get_clothing_by_id(&self, id: Uuid) -> Option<&Clothing> {
        self.clothes.get(&id)
    }

    pub fn update_clothing(&mut self, id: Uuid, updates: UpdateClothing) -> Option<Clothing> {
        if let Some(clothing) = self.clothes.get_mut(&id) {
            if let Some(label) = updates.label {
                clothing.label = label;
            }
            if let Some(clothing_type) = updates.clothing_type {
                clothing.clothing_type = clothing_type;
            }
            if let Some(season) = updates.season {
                clothing.season = season;
            }
            if let Some(wear_count) = updates.wear_count {
                clothing.wear_count = wear_count;
            }
            if let Some(image_url) = updates.image_url {
                clothing.image_url = Some(image_url);
            }
            Some(clothing.clone())
        } else {
            None
        }
    }

    pub fn delete_clothing(&mut self, id: Uuid) -> bool {
        self.clothes.remove(&id).is_some()
    }

    pub fn get_clothes_by_season(&self, season: Season) -> Vec<Clothing> {
        self.clothes
            .values()
            .filter(|c| c.season == season)
            .cloned()
            .collect()
    }

    pub fn get_clothes_by_type(&self, clothing_type: ClothingType) -> Vec<Clothing> {
        self.clothes
            .values()
            .filter(|c| c.clothing_type == clothing_type)
            .cloned()
            .collect()
    }
}
