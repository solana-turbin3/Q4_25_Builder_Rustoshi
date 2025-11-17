use anchor_lang::solana_program::hash::hashv;

use crate::state::Card;
use crate::constants::{
    CIRCLE, CROSS, SQUARE, STAR, TRIANGLE, WHOT
};


pub fn get_card_array<const N: usize>(id: u8, cards: [u8; N]) -> [Card; N] {
    let mut card_array = [Card::default(); N];

    for i in 0..N {
        card_array[i] = Card {
            id,
            card_number: cards[i],
        };
    }

    card_array
}


pub fn shuffle_cards(random_seed: u64) -> Vec<Card> {
    let mut full_deck: Vec<Card> = Vec::new();
    full_deck.extend_from_slice(&get_card_array(1, CIRCLE));
    full_deck.extend_from_slice(&get_card_array(2, TRIANGLE));
    full_deck.extend_from_slice(&get_card_array(3, CROSS));
    full_deck.extend_from_slice(&get_card_array(4, SQUARE));
    full_deck.extend_from_slice(&get_card_array(5, STAR));
    full_deck.extend_from_slice(&get_card_array(6, WHOT));


    // Fisher–Yates shuffle using Solana's hashv to generate pseudo-random indices
    let mut seed_bytes = random_seed.to_le_bytes();
    let len = full_deck.len();

    for i in (1..len).rev() {
        // Generate a new hash each iteration using the previous seed and index
        let hash = hashv(&[&seed_bytes, &(i as u64).to_le_bytes()]);
        let hash_bytes = hash.to_bytes();

        // Convert first 8 bytes of hash to u64 for randomness
        let rand_num = u64::from_le_bytes(hash_bytes[0..8].try_into().unwrap());
        let j = (rand_num % (i as u64 + 1)) as usize;

        full_deck.swap(i, j);

        // Update seed to this hash for next iteration
        seed_bytes = hash_bytes[0..8].try_into().unwrap();
    }

    return full_deck
} 


pub fn seeded_random_shape(random_seed: u64) -> u8 {
    // Allowed shapes (excluding WHOT = 6)
    const SHAPES: [u8; 5] = [1, 2, 3, 4, 5];

    // Convert seed to bytes
    let seed_bytes = random_seed.to_le_bytes();

    // Hash seed (one round)
    let hash = hashv(&[&seed_bytes]);
    let hash_bytes = hash.to_bytes();

    // First 8 bytes → u64
    let rand_num = u64::from_le_bytes(hash_bytes[0..8].try_into().unwrap());

    // Pick one of the 5 allowed shapes
    let index = (rand_num % (SHAPES.len() as u64)) as usize;

    SHAPES[index]
}