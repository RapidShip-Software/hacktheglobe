"""Comprehensive keyword-based chat fallback for when Gemini is unavailable.

Covers 50+ intent categories across medical, emotional, daily living,
social, cognitive, and practical scenarios for elderly patients.
"""

import random
from datetime import datetime

# Each entry: (list_of_keywords, list_of_response_templates)
# Checked in order - first match wins. More specific patterns listed first.
INTENT_PATTERNS: list[tuple[list[str], list[str]]] = [

    # =====================================================================
    # EMERGENCY / LIFE-THREATENING
    # =====================================================================
    (
        ["chest pain", "chest hurt", "heart attack", "can't breathe", "cannot breathe",
         "cant breathe", "hard to breathe", "difficulty breathing", "shortness of breath",
         "crushing", "pressure in chest", "arm numb", "jaw pain"],
        [
            "This sounds serious, {name}. Please call 911 right away, or tap the robin to reach Dr. Patel immediately. Don't wait. Your safety comes first.",
            "{name}, please call 911 or have someone call for you right now. If you can, tap the robin contact to reach Dr. Patel. I'm here with you.",
        ],
    ),
    (
        ["stroke", "face drooping", "slurred speech", "can't move arm", "cant move",
         "one side", "vision loss", "sudden confusion"],
        [
            "{name}, these could be signs of a stroke. Please call 911 immediately. Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911.",
        ],
    ),
    (
        ["fall", "fell", "fallen", "tripped", "slipped", "on the floor", "can't get up",
         "cant get up", "knocked", "stumbled"],
        [
            "Oh no, {name}! Are you hurt? If you're in pain or can't get up, please tap the butterfly to call Sarah or the robin for Dr. Patel right away. Stay still until help arrives.",
            "I'm worried about you, {name}. If you've fallen, don't try to get up too quickly. Call your family using the butterfly contacts. They'll want to help you.",
        ],
    ),
    (
        ["bleeding", "blood", "cut myself", "wound open", "stitches open", "incision"],
        [
            "{name}, if there's a lot of bleeding, press a clean cloth firmly on the area and call Dr. Patel using the robin contact. If it's from your surgery site, please call right away.",
        ],
    ),
    (
        ["unconscious", "passed out", "fainted", "blacked out", "collapsed"],
        [
            "{name}, if you just fainted or blacked out, please stay seated or lying down. Call Dr. Patel immediately using the robin contact, or tap a butterfly for family help.",
        ],
    ),

    # =====================================================================
    # MENTAL HEALTH - CRISIS
    # =====================================================================
    (
        ["want to die", "suicid", "kill myself", "end it", "no reason to live",
         "better off dead", "don't want to be here", "not worth living"],
        [
            "I hear you, {name}, and I'm so glad you're talking to me. You are loved and you matter deeply. Please tap the butterfly to call Sarah right now, she needs to know how you're feeling. If you're in crisis, please call 988 (Suicide & Crisis Lifeline). You are not alone.",
        ],
    ),

    # =====================================================================
    # EMOTIONAL / MENTAL HEALTH
    # =====================================================================
    (
        ["depress", "hopeless", "give up", "no point", "what's the point",
         "can't go on", "cant go on", "feeling low", "feeling down", "dark place"],
        [
            "I hear you, {name}, and I'm so glad you told me. You are loved and you matter. Please tap the butterfly to call Sarah right now. She would want to know how you're feeling. It's okay to not be okay.",
            "{name}, depression is something many people experience, and you don't have to face it alone. Please reach out to Sarah or Dr. Patel. They care about you deeply.",
        ],
    ),
    (
        ["sad", "unhappy", "miserable", "down", "blue", "gloomy", "heavy heart"],
        [
            "I'm sorry you're feeling this way, {name}. You're not alone, even when it feels that way. Would you like to call Sarah? Just tap her butterfly. Sometimes hearing a loved one's voice makes all the difference.",
            "It's okay to feel sad sometimes, {name}. Your family loves you very much. Tap a butterfly to call Sarah or James, they always brighten your day.",
        ],
    ),
    (
        ["lonely", "alone", "no one", "nobody", "isolated", "by myself", "miss people",
         "miss company", "no visitors", "nobody comes", "nobody cares", "all alone"],
        [
            "You're never truly alone, {name}. Your family thinks about you every day. Tap the butterfly to call Sarah or James right now. I bet they'd love to hear your voice.",
            "I understand that feeling, {name}. Loneliness is hard. But your family is just a tap away. Why not call Sarah? She always loves chatting with you.",
            "I'm here with you, {name}, and so is your family. Tap a butterfly anytime to reach them. You are cherished more than you know.",
        ],
    ),
    (
        ["miss", "miss my husband", "miss my wife", "miss him", "miss her",
         "passed away", "died", "gone", "grief", "mourning", "widowed"],
        [
            "I'm so sorry, {name}. Missing someone you love is one of the hardest things. It's okay to feel this way. Would you like to talk to Sarah? She understands and loves you.",
            "Grief takes time, {name}, and there's no right way to feel. Your loved ones are always in your heart. Tap the butterfly if you'd like to talk to family.",
        ],
    ),
    (
        ["crying", "cry", "tears", "can't stop crying", "weeping"],
        [
            "It's okay to cry, {name}. Sometimes we need to let it out. I'm here for you. When you're ready, tap a butterfly to talk to Sarah or James. They love you.",
        ],
    ),
    (
        ["anxious", "anxiety", "worried", "nervous", "scared", "afraid", "panic",
         "panicking", "heart racing", "can't relax", "cant relax", "restless",
         "uneasy", "on edge", "dread"],
        [
            "I understand, {name}. Take a slow, deep breath with me. In through your nose... hold... out through your mouth. You're safe. If you'd like to talk to someone, tap the butterfly to call Sarah.",
            "It's okay to feel anxious, {name}. Try taking a few slow breaths. Your garden is here, your family is just a tap away, and Dr. Patel is always available if you need reassurance.",
        ],
    ),
    (
        ["scared of falling", "afraid to fall", "afraid to walk", "fear of falling",
         "might fall", "unsteady", "wobbly", "balance"],
        [
            "That's a very common worry, {name}, and it's smart to be careful. Take your time when walking, hold onto furniture or your walker, and make sure your path is clear. If you feel unsteady, sit down and call for help.",
        ],
    ),
    (
        ["burden", "don't want to bother", "bothering everyone", "too much trouble",
         "causing trouble", "in the way", "useless", "worthless", "not useful"],
        [
            "Oh {name}, you are never a burden. Your family helps you because they love you, not because they have to. You have given so much to everyone around you. Please don't ever feel that way.",
            "{name}, taking care of you is something your family WANTS to do. You are important and valued. Tap the butterfly to call Sarah, she would tell you the same thing.",
        ],
    ),
    (
        ["angry", "mad", "frustrated", "annoyed", "irritated", "furious", "fed up",
         "sick of", "hate", "stupid"],
        [
            "I understand your frustration, {name}. It's okay to feel angry sometimes. Would you like to talk about what's bothering you, or would you prefer to call Sarah?",
            "Those feelings are valid, {name}. Take a moment to breathe. If something specific is upsetting you, I'm here to listen, or you can tap a butterfly to talk to family.",
        ],
    ),
    (
        ["tired", "exhausted", "no energy", "fatigue", "fatigued", "worn out",
         "drained", "weak", "sleepy", "drowsy", "lethargic"],
        [
            "Rest is important, {name}. Make sure you're getting enough sleep and staying hydrated. If you've been feeling tired for several days, it might be worth mentioning to Dr. Patel at your next visit.",
            "Take it easy today, {name}. A short rest and some water can do wonders. Your body is still healing. Let Dr. Patel know if the tiredness continues.",
        ],
    ),
    (
        ["bored", "boring", "nothing to do", "stuck inside", "restless"],
        [
            "How about tending to your garden, {name}? Logging your blood pressure or checking in helps your plant grow! You could also call Sarah for a nice chat.",
            "I understand, {name}. Maybe a gentle walk, listening to some music, or calling James would lift your spirits? Your garden always appreciates a check-in too!",
        ],
    ),
    (
        ["stressed", "stress", "overwhelmed", "too much", "can't cope", "cant cope"],
        [
            "I'm sorry you're feeling overwhelmed, {name}. Let's take it one step at a time. A few deep breaths can help. If you need to talk, tap the butterfly to call Sarah.",
        ],
    ),
    (
        ["nighttime", "night time", "dark", "can't sleep", "cant sleep", "insomnia",
         "wake up", "waking up", "bad dream", "nightmare", "restless night"],
        [
            "Nighttime can be tough, {name}. Try some deep breathing or a warm drink (no caffeine). If sleep trouble continues, mention it to Dr. Patel. You can also call Sarah if you need company.",
            "I'm sorry you can't sleep, {name}. Try to keep your room dark and cool. A warm cup of herbal tea might help. If this keeps happening, Dr. Patel can help.",
        ],
    ),

    # =====================================================================
    # SYMPTOMS - GENERAL
    # =====================================================================
    (
        ["dizzy", "dizziness", "lightheaded", "light headed", "faint", "vertigo",
         "room spinning", "spinning", "woozy", "unsteady"],
        [
            "Please sit down somewhere safe right away, {name}. Have some water. If the dizziness doesn't pass in a few minutes, tap the robin to call Dr. Patel.",
            "Dizziness can be concerning, {name}. Please sit down and rest. Make sure you've taken your medications and had enough water. If it continues, please contact Dr. Patel.",
        ],
    ),
    (
        ["headache", "head hurt", "head ache", "migraine", "head pounding",
         "head pain", "temple", "throbbing"],
        [
            "I'm sorry about the headache, {name}. Have some water and rest in a quiet spot. You can take your Acetaminophen if needed. If it's sudden and severe, please call Dr. Patel right away.",
        ],
    ),
    (
        ["nausea", "nauseous", "sick", "vomit", "throw up", "throwing up",
         "queasy", "stomach", "tummy", "belly", "sick to my stomach"],
        [
            "I'm sorry you're feeling unwell, {name}. Try sipping water slowly and eating plain crackers. If you can't keep anything down or it gets worse, please tap the robin to call Dr. Patel.",
        ],
    ),
    (
        ["pain", "hurt", "hurts", "ache", "aching", "sore", "soreness", "tender",
         "throbbing", "sharp pain", "ow", "ouch", "oow", "oww", "agony"],
        [
            "I'm sorry you're in pain, {name}. If it's mild, you can take your Acetaminophen. If the pain is severe, new, or doesn't go away, please tap the robin to reach Dr. Patel.",
            "Pain is no fun, {name}. Rest the area and consider taking your Acetaminophen. Please let Dr. Patel know if it doesn't improve or if it's getting worse.",
        ],
    ),
    (
        ["swollen", "swelling", "puffy", "bloated", "water retention", "edema",
         "ankles swollen", "legs swollen", "feet swollen"],
        [
            "Swelling can sometimes be a sign that needs attention, {name}. Elevate the area if you can. If it's in your legs or ankles, please mention it to Dr. Patel, as it could be related to your blood pressure.",
        ],
    ),
    (
        ["hip", "hip pain", "hip hurts", "surgery site", "incision", "scar",
         "hip replacement", "new hip", "joint"],
        [
            "It's normal to have some discomfort as your hip heals, {name}. Keep up with your exercises and take Acetaminophen if needed. If you notice sudden sharp pain, redness, or warmth around the area, please call Dr. Patel.",
        ],
    ),
    (
        ["constipat", "can't go", "haven't gone", "bowel", "bathroom trouble",
         "stomach hard", "bloated"],
        [
            "That's quite common, {name}, especially with some medications. Try drinking more water and eating fruits like prunes or apples. A gentle walk can also help. If it continues for more than a few days, mention it to Dr. Patel.",
        ],
    ),
    (
        ["diarr", "loose stool", "runs", "bathroom a lot", "urgent bathroom"],
        [
            "I'm sorry, {name}. Make sure to drink plenty of water to stay hydrated. If it continues for more than a day or you feel weak, please contact Dr. Patel.",
        ],
    ),
    (
        ["cough", "coughing", "cold", "flu", "runny nose", "stuffy", "congestion",
         "sneezing", "sore throat", "throat hurt", "fever", "chills", "temperature"],
        [
            "I'm sorry you're not feeling well, {name}. Rest and drink plenty of fluids. If you develop a fever over 38C or the symptoms get worse, please call Dr. Patel.",
        ],
    ),
    (
        ["rash", "itchy", "itch", "hives", "skin", "bumps", "red spot"],
        [
            "A rash could be a reaction to something, {name}. If it appeared after starting a new medication, please contact Dr. Patel soon. If you also have trouble breathing, call 911.",
        ],
    ),
    (
        ["blurry", "vision", "can't see", "cant see", "eyes", "eye hurt"],
        [
            "Vision changes can be important to report, {name}. If it's sudden, please contact Dr. Patel right away. It could be related to your blood pressure.",
        ],
    ),
    (
        ["numbness", "numb", "tingling", "pins and needles", "tingly"],
        [
            "Numbness or tingling is worth reporting, {name}. It can sometimes be related to diabetes. Please mention it to Dr. Patel at your next visit, or call now if it's sudden.",
        ],
    ),
    (
        ["thirsty", "dry mouth", "drinking a lot", "peeing a lot", "urinating a lot",
         "frequent urination"],
        [
            "Increased thirst and frequent urination can be signs your blood sugar needs checking, {name}. Make sure to stay hydrated and mention this to Dr. Patel.",
        ],
    ),
    (
        ["blood sugar", "sugar level", "glucose", "diabetes", "diabetic", "sugar high",
         "sugar low", "hypoglyc", "hyperglyc"],
        [
            "Managing your diabetes is important, {name}. Your Metformin helps keep your blood sugar steady. Make sure to take it with food. If you feel shaky, sweaty, or confused, have some juice and call Dr. Patel.",
        ],
    ),

    # =====================================================================
    # MEDICATIONS
    # =====================================================================
    (
        ["blood pressure", "bp", "pressure high", "pressure low", "hypertension",
         "high blood pressure", "low blood pressure"],
        [
            "You can log your blood pressure anytime using the heart button, {name}! Your Lisinopril helps keep it in a healthy range. Regular logging helps Dr. Patel track your trends.",
            "Keeping track of your blood pressure is wonderful, {name}! Tap the heart button to log it. Your garden grows a little each time you do!",
        ],
    ),
    (
        ["medication", "medicine", "pill", "pills", "drug", "drugs", "prescription",
         "rx", "tablet", "capsule"],
        [
            "Your medications are important, {name}! You take Lisinopril 10mg in the morning for blood pressure, and Metformin 500mg morning and evening for diabetes. Acetaminophen is available as needed for pain. Your garden blooms when you take them on time!",
        ],
    ),
    (
        ["lisinopril"],
        [
            "Lisinopril helps keep your blood pressure healthy, {name}. You take 10mg every morning. If you notice a dry cough or dizziness, let Dr. Patel know.",
        ],
    ),
    (
        ["metformin"],
        [
            "Metformin helps manage your blood sugar, {name}. You take 500mg in the morning and evening, with food. If you feel nauseous, try taking it in the middle of your meal.",
        ],
    ),
    (
        ["acetaminophen", "tylenol", "painkiller", "pain relief", "pain killer"],
        [
            "Acetaminophen is your pain reliever, {name}. You can take 500mg as needed, but try not to exceed 3000mg per day. If you need it regularly, let Dr. Patel know.",
        ],
    ),
    (
        ["side effect", "reaction", "making me sick", "from the pills"],
        [
            "Side effects can happen, {name}. Common ones include nausea from Metformin and a dry cough from Lisinopril. If something feels wrong or new, please contact Dr. Patel.",
        ],
    ),
    (
        ["forgot", "forget", "missed", "skip", "didn't take", "didnt take",
         "ran out", "run out", "refill", "pharmacy", "prescription"],
        [
            "It happens, {name}! If you just remembered, go ahead and take it now (unless it's almost time for your next dose). If you're running low, tap the robin to contact Dr. Patel about a refill.",
        ],
    ),
    (
        ["when do i take", "what time", "schedule", "how often", "dosage", "dose",
         "how much", "how many"],
        [
            "Here's your schedule, {name}: Lisinopril 10mg every morning, Metformin 500mg morning and evening with food, and Acetaminophen 500mg as needed for pain. Your garden reminds you too!",
        ],
    ),

    # =====================================================================
    # DAILY LIVING
    # =====================================================================
    (
        ["eat", "food", "hungry", "meal", "cook", "cooking", "breakfast", "lunch",
         "dinner", "snack", "recipe", "diet", "nutrition", "what should i eat"],
        [
            "Eating well is so important, {name}! For your diabetes, try to eat regular meals with vegetables, lean protein, and whole grains. Avoid sugary drinks and too many sweets. Remember to take your Metformin with food!",
            "A balanced diet helps your garden grow, {name}! Good choices: vegetables, fish, chicken, brown rice, whole wheat bread. Try to limit sugar, white bread, and salty foods.",
        ],
    ),
    (
        ["water", "drink", "thirst", "hydrat", "dehydrat", "fluid"],
        [
            "Great reminder, {name}! Try to drink 6-8 glasses of water throughout the day. Staying hydrated helps your blood pressure and energy levels. Keep a glass near your chair!",
        ],
    ),
    (
        ["walk", "exercise", "move", "active", "steps", "physio", "physiotherapy",
         "rehab", "rehabilitation", "stretching", "stretch"],
        [
            "Gentle movement is wonderful for your recovery, {name}! Even a short walk around the house helps. Do your hip exercises as the physiotherapist showed you. Just listen to your body and don't overdo it.",
            "Staying active helps your garden bloom, {name}! A few minutes of gentle walking or your hip exercises make a big difference. Take it slow and hold onto something sturdy.",
        ],
    ),
    (
        ["bath", "shower", "wash", "hygiene", "clean", "grooming"],
        [
            "Safety first in the bathroom, {name}! Use grab bars and a non-slip mat. A shower chair can help you feel more secure. Take your time and don't rush.",
        ],
    ),
    (
        ["walker", "cane", "wheelchair", "mobility aid", "walking aid", "rollator"],
        [
            "Using your walker is very wise, {name}! It keeps you safe while your hip heals. Make sure the path is clear of rugs or cords that could trip you.",
        ],
    ),
    (
        ["hot", "cold", "weather", "rain", "snow", "ice", "warm", "cool", "temperature outside"],
        [
            "Whatever the weather, your indoor garden is always perfect, {name}! If it's cold, stay warm and be careful on icy surfaces. If it's hot, drink extra water. Your health comes first!",
        ],
    ),
    (
        ["incontinen", "accident", "pee", "wetting", "bladder", "leak"],
        [
            "That's more common than you think, {name}, and nothing to be embarrassed about. Drink water regularly and try going to the bathroom on a schedule. Dr. Patel can help with this.",
        ],
    ),

    # =====================================================================
    # SOCIAL / RELATIONSHIPS
    # =====================================================================
    (
        ["grandchild", "grandkid", "grandson", "granddaughter", "grandchildren",
         "great grand"],
        [
            "I bet your grandchildren love you very much, {name}! Would you like to call Sarah to ask about them? Tap the butterfly anytime!",
        ],
    ),
    (
        ["church", "temple", "mosque", "synagogue", "faith", "pray", "prayer",
         "god", "spiritual", "worship", "service", "mass"],
        [
            "Faith can be a wonderful source of comfort, {name}. Even if you can't attend in person right now, you can still pray and find peace. Would you like to call someone from your community?",
        ],
    ),
    (
        ["holiday", "christmas", "easter", "birthday", "thanksgiving", "new year",
         "anniversary", "celebration", "special day"],
        [
            "Special days can bring mixed feelings, {name}. I hope you have something lovely planned! Why not call Sarah or James to chat about it? Tap the butterfly!",
        ],
    ),
    (
        ["friend", "neighbour", "neighbor", "visitor", "visit", "company", "social"],
        [
            "Social connections are so important, {name}! I hope you get to see friends and neighbours soon. In the meantime, your family is always a butterfly tap away.",
        ],
    ),
    (
        ["tv", "television", "show", "movie", "watch", "programme", "program",
         "channel", "news", "radio", "music", "song", "listen"],
        [
            "Enjoying some entertainment sounds lovely, {name}! Watching a good show or listening to music can really lift your spirits. What do you like to watch?",
        ],
    ),
    (
        ["book", "read", "reading", "magazine", "crossword", "puzzle", "sudoku",
         "game", "cards"],
        [
            "That's wonderful for keeping your mind sharp, {name}! Puzzles and reading are great. Your brain needs exercise just like your body.",
        ],
    ),
    (
        ["pet", "cat", "dog", "bird", "fish", "animal", "kitty", "puppy"],
        [
            "Pets are such wonderful companions, {name}! They bring so much joy. Animals are great for the spirit.",
        ],
    ),

    # =====================================================================
    # FAMILY / CAREGIVER
    # =====================================================================
    (
        ["sarah", "daughter"],
        [
            "Sarah loves you so much, {name}! Tap the blue butterfly to call her anytime. She's always happy to hear from you.",
        ],
    ),
    (
        ["james", "son"],
        [
            "James cares about you deeply, {name}! Tap the green butterfly to give him a call. I'm sure he'd love to chat.",
        ],
    ),
    (
        ["dr patel", "doctor", "physician", "gp", "clinic", "hospital", "appointment"],
        [
            "Dr. Patel is there for your medical needs, {name}. You can reach the office by tapping the robin contact. If you need to schedule an appointment, they can help you with that.",
        ],
    ),
    (
        ["call", "phone", "ring", "contact", "reach", "talk to"],
        [
            "You can reach your family anytime by tapping the butterflies, {name}! Sarah is the blue butterfly, James is the green one, and Dr. Patel is the robin.",
        ],
    ),

    # =====================================================================
    # COGNITIVE
    # =====================================================================
    (
        ["forget", "memory", "remember", "confused", "confusion", "foggy",
         "can't remember", "cant remember", "what was i", "where am i",
         "what day", "what time", "forgetful"],
        [
            "It's perfectly normal to forget things sometimes, {name}. Don't worry too much. Writing things down can help. If you're concerned about your memory, Dr. Patel can check it at your next visit.",
            "Everyone forgets things now and then, {name}. Your medications and check-ins help keep you on track. If you're feeling confused, please rest and drink some water.",
        ],
    ),
    (
        ["what day is it", "what's the date", "what date", "what is today",
         "is it morning", "is it afternoon", "what time is it"],
        [
            "Today is {today}, {name}. I hope you're having a good day! Don't forget your medications and a check-in.",
        ],
    ),

    # =====================================================================
    # PRACTICAL
    # =====================================================================
    (
        ["ambulance", "emergency", "911", "urgent care", "er ", "emergency room"],
        [
            "If this is an emergency, {name}, please call 911 right away. Your safety is the most important thing. I'm here with you.",
        ],
    ),
    (
        ["transport", "ride", "drive", "taxi", "bus", "car", "get there",
         "how do i get"],
        [
            "For transportation to appointments, {name}, ask Sarah or James to help arrange a ride. Tap the butterfly to call them! Many communities also have senior transport services.",
        ],
    ),

    # =====================================================================
    # APP / TECHNOLOGY
    # =====================================================================
    (
        ["help", "how do i", "how does", "what do i", "how to", "tutorial",
         "instructions", "guide", "explain", "confused about app", "what is this"],
        [
            "I'm here to help, {name}! Here's what you can do: tap the heart button to log your blood pressure, take medications when reminded, check in daily, and call family by tapping the butterflies. Your garden grows when you do these things!",
        ],
    ),
    (
        ["button", "tap", "press", "click", "screen", "touch", "swipe"],
        [
            "You're doing great with the app, {name}! The heart button logs your blood pressure, the butterflies call your family, and the gate (Help) brings you here to chat with me. Just tap gently!",
        ],
    ),
    (
        ["broken", "not working", "doesn't work", "error", "glitch", "bug",
         "wrong", "problem with", "issue"],
        [
            "I'm sorry you're having trouble, {name}. Try closing and reopening the app. If the problem continues, your family can help. Tap a butterfly to call Sarah or James.",
        ],
    ),
    (
        ["too small", "can't read", "cant read", "text small", "font", "bigger",
         "hard to see", "hard to read"],
        [
            "I'm sorry about that, {name}. Try holding your iPad a bit closer, or ask Sarah to help adjust the text size in your device settings.",
        ],
    ),

    # =====================================================================
    # GREETINGS / PLEASANTRIES
    # =====================================================================
    (
        ["hello", "hi ", "hey", "hiya", "hola", "howdy", "good morning",
         "good afternoon", "good evening", "good day", "morning", "afternoon"],
        [
            "Hello, {name}! Lovely to see you. How are you feeling today? Your garden is looking beautiful!",
            "Hi there, {name}! Welcome back to your garden. Is there anything I can help you with today?",
            "Good to see you, {name}! Your plant has been growing nicely. How can I help you today?",
        ],
    ),
    (
        ["how are you", "how r u", "how're you", "how you doing", "hows it going",
         "what's up", "whats up", "sup"],
        [
            "I'm doing well, thank you for asking, {name}! More importantly, how are YOU feeling today? Your garden and I are always here for you.",
        ],
    ),
    (
        ["who are you", "what are you", "your name", "what's your name"],
        [
            "I'm your Garden Helper, {name}! I'm here to support you, remind you about your health, and keep you company. Think of me as a friendly guide for your wellness garden.",
        ],
    ),
    (
        ["thank", "thanks", "appreciate", "grateful", "you're great", "you're sweet",
         "so kind", "wonderful"],
        [
            "You're very welcome, {name}! I'm always here for you. Your garden appreciates you too!",
            "Anytime, {name}! That's what I'm here for. Don't hesitate to ask if you need anything else.",
            "It's my pleasure, {name}! You deserve all the support in the world.",
        ],
    ),
    (
        ["bye", "goodbye", "see you", "good night", "goodnight", "night", "later",
         "take care", "gotta go", "leaving", "ttyl"],
        [
            "Goodbye, {name}! Take care and have a wonderful rest of your day. Your garden will be here waiting!",
            "Sweet dreams, {name}! Remember, your family and your garden love you. See you next time!",
            "Take care, {name}! Don't forget your medications and a glass of water. See you soon!",
        ],
    ),
    (
        ["yes", "yeah", "yep", "yup", "sure", "ok", "okay", "alright", "right"],
        [
            "Great, {name}! Is there anything else I can help you with? I'm always here.",
        ],
    ),
    (
        ["no", "nope", "nah", "not really", "i'm fine", "im fine", "i'm ok", "im ok"],
        [
            "That's perfectly fine, {name}! I'm here whenever you need me. Enjoy your day and remember your garden loves you!",
        ],
    ),

    # =====================================================================
    # POSITIVE / WELLBEING
    # =====================================================================
    (
        ["good", "great", "fine", "well", "happy", "wonderful", "better", "fantastic",
         "amazing", "lovely", "blessed", "grateful", "content", "peaceful"],
        [
            "That's wonderful to hear, {name}! Your positive spirit helps your garden bloom. Keep up the great work with your health!",
            "I'm so glad, {name}! You deserve to feel good. Your garden is thriving just like you!",
            "How lovely, {name}! Your good mood is making your plant extra happy today!",
        ],
    ),
    (
        ["so-so", "not bad", "meh", "alright", "ok i guess", "could be better",
         "managing", "getting by", "surviving"],
        [
            "That's perfectly okay, {name}. Every day is different. Is there anything I can help with to make today a little better?",
            "I appreciate your honesty, {name}. Some days are like that. Remember, your family is just a butterfly tap away if you want company.",
        ],
    ),

    # =====================================================================
    # RANDOM / HUMOR / FRUSTRATION
    # =====================================================================
    (
        ["joke", "funny", "make me laugh", "tell me something", "entertain",
         "cheer me up"],
        [
            "Here's one for you, {name}: Why did the gardener plant lightbulbs? Because he wanted to grow a power plant! I hope that brought a little smile!",
            "What did the big flower say to the little flower? Hi there, bud! Your garden helper loves making you smile, {name}!",
            "Why do flowers always drive so fast? They put the petal to the metal! I hope your day is blooming, {name}!",
        ],
    ),
    (
        ["love you", "i love", "you're the best", "best friend", "like you"],
        [
            "That means so much, {name}! I care about you too. Your wellbeing is the most important thing to me. You make this garden special!",
        ],
    ),
    (
        ["damn", "dammit", "crap", "hell", "ugh", "argh", "grr", "aargh", "blah"],
        [
            "I hear your frustration, {name}. Bad moments don't mean a bad day. Take a breath. I'm here if you want to talk about what's bothering you.",
        ],
    ),
    (
        ["shut up", "leave me alone", "go away", "stop", "be quiet", "enough"],
        [
            "I understand, {name}. I'll be right here whenever you need me. Just tap Help when you want to chat again. Take care of yourself.",
        ],
    ),
]

# Absolute fallback if nothing matches
DEFAULT_RESPONSES = [
    "I'm here for you, {name}! If you need anything, just ask. You can also tap a butterfly to call your family anytime.",
    "Thank you for sharing, {name}. Remember, your garden grows when you log your blood pressure and take your medications. I'm always here if you need me!",
    "I appreciate you talking to me, {name}! Don't forget to check in daily, it helps your plant grow. Your family is always just a butterfly tap away.",
    "That's interesting, {name}! I'm always learning from you. Is there anything health-related I can help with today?",
    "I'm glad you're here, {name}! Your garden is looking lovely. Remember to stay hydrated and take your medications on time.",
]

_default_index = 0


def get_fallback_response(message: str, patient_name: str = "Margaret") -> str:
    """Match user message to an appropriate fallback response."""
    global _default_index
    msg_lower = message.lower()

    # Get today's date for time-related queries
    today = datetime.now().strftime("%A, %B %d")

    for keywords, responses in INTENT_PATTERNS:
        for keyword in keywords:
            if keyword in msg_lower:
                reply = random.choice(responses)
                return reply.format(name=patient_name, today=today)

    # No match - rotate through defaults
    reply = DEFAULT_RESPONSES[_default_index % len(DEFAULT_RESPONSES)]
    _default_index += 1
    return reply.format(name=patient_name, today=today)
