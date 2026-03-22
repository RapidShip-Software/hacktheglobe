"""Comprehensive keyword-based chat fallback for when Gemini is unavailable.

Covers all demo scenarios an elderly patient (Margaret) would encounter.
Responses are warm, empathetic, and appropriate for a healthcare context.
"""

import random

# Intent patterns: list of (keywords, response_templates)
# Checked in order - first match wins. More specific patterns first.
INTENT_PATTERNS: list[tuple[list[str], list[str]]] = [
    # --- EMERGENCY / URGENT ---
    (
        ["chest pain", "chest hurt", "heart attack", "can't breathe", "cannot breathe"],
        [
            "Oh dear, {name}, that sounds serious. Please call 911 right away, or tap the robin to reach Dr. Patel immediately. Your safety comes first.",
            "{name}, please don't wait on this. Call 911 or tap the robin contact to reach Dr. Patel right now. I'm here with you.",
        ],
    ),
    (
        ["fall", "fell", "fallen", "tripped"],
        [
            "Oh no, {name}! Are you hurt? If you're in pain or can't get up, please tap the butterfly to call Sarah or the robin for Dr. Patel right away.",
            "I'm worried about you, {name}. If you've fallen and feel hurt, please call your family using the butterfly contacts. They'll want to help.",
        ],
    ),
    # --- EMOTIONAL / MENTAL HEALTH ---
    (
        ["depress", "hopeless", "give up", "no point", "want to die", "suicid"],
        [
            "I hear you, {name}, and I'm so glad you're talking to me. You are loved and you matter. Please tap the butterfly to call Sarah right now. She would want to know how you're feeling. If you're in crisis, please call 988.",
        ],
    ),
    (
        ["sad", "lonely", "alone", "miss", "crying", "cry", "upset", "unhappy", "miserable"],
        [
            "I'm sorry you're feeling this way, {name}. You're not alone, even when it feels that way. Would you like to call Sarah? Just tap her butterfly. Sometimes hearing a loved one's voice makes all the difference.",
            "It's okay to feel sad sometimes, {name}. Your family loves you very much. Tap a butterfly to call Sarah or James, they always brighten your day.",
            "I wish I could give you a hug, {name}. Please reach out to your family, they care about you so much. Tap the butterfly to call Sarah.",
        ],
    ),
    (
        ["anxious", "anxiety", "worried", "nervous", "scared", "afraid", "panic"],
        [
            "I understand, {name}. Take a slow, deep breath with me. Breathe in... and out. You're safe. If you'd like to talk to someone, tap the butterfly to call Sarah.",
            "It's okay to feel anxious, {name}. Try taking a few slow breaths. Your garden is here, your family is just a tap away, and Dr. Patel is always available if you need reassurance.",
        ],
    ),
    (
        ["tired", "exhausted", "no energy", "fatigue", "sleepy", "can't sleep", "insomnia"],
        [
            "Rest is important, {name}. Make sure you're getting enough sleep and staying hydrated. If you've been feeling tired for several days, it might be worth mentioning to Dr. Patel.",
            "Take it easy today, {name}. A short rest can do wonders. Don't forget to drink some water, and let Dr. Patel know if the tiredness continues.",
        ],
    ),
    (
        ["bored", "boring", "nothing to do"],
        [
            "How about tending to your garden, {name}? Logging your blood pressure or checking in helps your plant grow! You could also call Sarah for a nice chat.",
            "I understand, {name}. Maybe a short walk around the house or a call to James would lift your spirits? Your garden always appreciates a check-in too!",
        ],
    ),
    # --- SYMPTOMS ---
    (
        ["dizzy", "dizziness", "lightheaded", "faint", "vertigo", "room spinning"],
        [
            "Please sit down somewhere safe right away, {name}. Have some water. If the dizziness doesn't pass in a few minutes, tap the robin to call Dr. Patel.",
            "Dizziness can be concerning, {name}. Please sit down and rest. Make sure you've taken your medications today. If it continues, please contact Dr. Patel.",
        ],
    ),
    (
        ["headache", "head hurt", "migraine"],
        [
            "I'm sorry about the headache, {name}. Have some water and rest in a quiet spot. You can take your Acetaminophen if needed. If it's severe or sudden, please call Dr. Patel.",
        ],
    ),
    (
        ["nausea", "nauseous", "sick", "vomit", "throw up"],
        [
            "I'm sorry you're feeling unwell, {name}. Try sipping some water slowly. If you can't keep anything down or it gets worse, please tap the robin to call Dr. Patel.",
        ],
    ),
    (
        ["pain", "hurt", "ache", "sore", "swollen", "swelling"],
        [
            "I'm sorry you're in pain, {name}. If it's mild, you can take your Acetaminophen. If the pain is severe or new, please tap the robin to reach Dr. Patel.",
            "Pain is no fun, {name}. Rest up and consider taking your Acetaminophen. Please let Dr. Patel know if it doesn't improve.",
        ],
    ),
    (
        ["blood pressure", "bp", "pressure high", "pressure low"],
        [
            "Great question, {name}! You can log your blood pressure anytime using the heart button. Your doctor monitors the trends to keep you healthy.",
            "Keeping track of your blood pressure is wonderful, {name}! Tap the heart button to log it. Your garden grows a little each time you do!",
        ],
    ),
    # --- MEDICATIONS ---
    (
        ["medication", "medicine", "pill", "drug", "lisinopril", "metformin", "acetaminophen"],
        [
            "Your medications are so important, {name}! You take Lisinopril in the morning for blood pressure and Metformin morning and evening for diabetes. Your garden blooms when you take them on time!",
            "Great that you're thinking about your medications, {name}! Remember, Lisinopril in the morning and Metformin twice a day. Each one helps your garden grow.",
        ],
    ),
    (
        ["forgot", "forget", "missed", "skip"],
        [
            "It happens, {name}! If you just remembered, go ahead and take it now. If you're not sure, tap the robin to check with Dr. Patel. Your garden is forgiving!",
        ],
    ),
    # --- GREETINGS ---
    (
        ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        [
            "Hello, {name}! Lovely to see you. How are you feeling today? Your garden is looking beautiful!",
            "Hi there, {name}! Welcome back to your garden. Is there anything I can help you with today?",
            "Good to see you, {name}! Your plant has been growing nicely. How can I help you today?",
        ],
    ),
    (
        ["how are you", "how r u"],
        [
            "I'm doing well, thank you for asking, {name}! More importantly, how are YOU feeling today?",
        ],
    ),
    (
        ["thank", "thanks"],
        [
            "You're very welcome, {name}! I'm always here for you. Your garden appreciates you too!",
            "Anytime, {name}! That's what I'm here for. Don't hesitate to ask if you need anything else.",
        ],
    ),
    (
        ["bye", "goodbye", "see you", "good night", "night"],
        [
            "Goodbye, {name}! Take care and have a wonderful rest of your day. Your garden will be here waiting!",
            "Sweet dreams, {name}! Remember, your family and your garden love you. See you next time!",
        ],
    ),
    # --- GARDEN / APP ---
    (
        ["garden", "plant", "flower", "grow"],
        [
            "Your garden reflects your health journey, {name}! Every time you log your blood pressure, take your medication, or check in, your plant grows and blooms.",
            "The garden is a reflection of you, {name}! When you take care of yourself, your plant thrives. It's looking lovely today!",
        ],
    ),
    (
        ["butterfly", "call", "phone", "contact", "family"],
        [
            "You can reach your family anytime by tapping the butterflies, {name}! Sarah is the blue butterfly, and James is the green one. Dr. Patel is the robin.",
            "Your family is always just a tap away, {name}! Tap any butterfly to call them. They love hearing from you.",
        ],
    ),
    (
        ["help", "what can you do", "how does this work", "confused"],
        [
            "I'm here to help, {name}! You can log your blood pressure with the heart button, take your medications when reminded, check in daily, and call your family by tapping the butterflies. Your garden grows when you do these things!",
        ],
    ),
    # --- FOOD / DAILY LIFE ---
    (
        ["eat", "food", "hungry", "meal", "cook", "breakfast", "lunch", "dinner"],
        [
            "Eating well is so important, {name}! Try to have regular meals with plenty of vegetables. Remember to take your Metformin with food.",
            "A good meal does wonders, {name}! Make sure to eat something nutritious. Your medications work best when taken with food.",
        ],
    ),
    (
        ["walk", "exercise", "move", "active", "steps"],
        [
            "A gentle walk is wonderful for you, {name}! Even a short stroll around the house helps. Just make sure to take it easy and stay safe.",
            "Staying active is great for your garden, {name}! Even a few minutes of gentle movement makes a difference. Just listen to your body.",
        ],
    ),
    (
        ["weather", "rain", "sun", "cold", "hot", "warm"],
        [
            "Whatever the weather, your garden here is always sunny when you take care of yourself, {name}! Stay comfortable and don't forget to hydrate.",
        ],
    ),
    # --- POSITIVE ---
    (
        ["good", "great", "fine", "well", "happy", "wonderful", "better", "fantastic"],
        [
            "That's wonderful to hear, {name}! Your positive spirit helps your garden bloom. Keep up the great work with your health!",
            "I'm so glad, {name}! You deserve to feel good. Your garden is thriving just like you!",
        ],
    ),
    (
        ["ok", "okay", "alright", "so-so", "not bad"],
        [
            "That's perfectly okay, {name}. Every day is different. Is there anything I can help with to make today a little better?",
        ],
    ),
]

# Absolute fallback if nothing matches
DEFAULT_RESPONSES = [
    "I'm here for you, {name}! If you need anything, just ask. You can also tap a butterfly to call your family anytime.",
    "Thank you for sharing, {name}. Remember, your garden grows when you log your blood pressure and take your medications. I'm always here if you need me!",
    "I appreciate you talking to me, {name}! Don't forget to check in daily, it helps your plant grow. Your family is always just a butterfly tap away.",
]

_default_index = 0


def get_fallback_response(message: str, patient_name: str = "Margaret") -> str:
    """Match user message to an appropriate fallback response."""
    global _default_index
    msg_lower = message.lower()

    for keywords, responses in INTENT_PATTERNS:
        for keyword in keywords:
            if keyword in msg_lower:
                return random.choice(responses).format(name=patient_name)

    # No match - rotate through defaults
    reply = DEFAULT_RESPONSES[_default_index % len(DEFAULT_RESPONSES)].format(name=patient_name)
    _default_index += 1
    return reply
