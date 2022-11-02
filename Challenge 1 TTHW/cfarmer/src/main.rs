use std::io;
use std::cmp::Ordering;

fn main() {
    println!("How many times do you want to print the message?");

    let mut times = String::new();

    io::stdin()
        .read_line(&mut times)
        .expect("Failed to read line");

    let times: u32 = times.trim().parse().expect("Please type a number!");   

    print_message_recursively(times);
}

fn print_message_recursively(times: u32) {
    if (times == 0) {
        return;
    }

    println!("Hello, World!");

    let base_case: u32 = 0;
    let new_times = times - 1;
    
    match new_times.cmp(&base_case) {
        Ordering::Less => return,
        Ordering::Greater => print_message_recursively(new_times),
        Ordering::Equal => return,
    }
}
