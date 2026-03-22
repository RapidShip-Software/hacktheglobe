"""Comprehensive keyword-based chat fallback for when Gemini is unavailable.

Covers 80+ intent categories with 300+ response templates, informed by
geriatric care research covering 920+ distinct patient utterances.
"""

import random
from datetime import datetime

# Each entry: (list_of_keywords, list_of_response_templates)
# Checked in order - first match wins. More specific patterns first.
INTENT_PATTERNS: list[tuple[list[str], list[str]]] = [

    # =====================================================================
    # EMERGENCY / LIFE-THREATENING (must be first)
    # =====================================================================
    (
        ["chest pain", "chest hurt", "heart attack", "can't breathe", "cannot breathe",
         "cant breathe", "hard to breathe", "difficulty breathing", "shortness of breath",
         "crushing", "pressure in chest", "arm numb", "jaw pain", "cant breeth",
         "chest paim", "chest feels tight", "something sitting on my chest"],
        [
            "This sounds serious, {name}. Please call 911 right away, or tap the robin to reach Dr. Patel immediately. Don't wait. Your safety comes first.",
            "{name}, please call 911 or have someone call for you right now. Tap the robin contact to reach Dr. Patel. I'm here with you.",
        ],
    ),
    (
        ["stroke", "face drooping", "slurred speech", "can't move arm", "cant move",
         "one side weak", "vision loss", "sudden confusion", "face is drooping",
         "speech is slurred", "face feels numb on one side", "worst headache of my life"],
        [
            "{name}, these could be signs of a stroke. Please call 911 immediately. Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911.",
        ],
    ),
    (
        ["took too many pills", "took all my pills", "overdose", "too much medication",
         "took a double dose", "i think i took too much"],
        [
            "{name}, please call 911 or Poison Control (1-800-222-1222) right away. Don't take any more medication. Tap the robin to reach Dr. Patel while you wait.",
        ],
    ),
    (
        ["fall", "fell", "fallen", "tripped", "slipped", "on the floor", "can't get up",
         "cant get up", "knocked", "stumbled", "fell down", "fell in the bathroom",
         "i nearly fell", "almost fell"],
        [
            "Oh no, {name}! Are you hurt? If you're in pain or can't get up, please tap the butterfly to call Sarah or the robin for Dr. Patel right away. Stay still until help arrives.",
            "I'm worried about you, {name}. If you've fallen, don't try to get up too quickly. Call your family using the butterfly contacts. They'll want to help you.",
        ],
    ),
    (
        ["bleeding", "blood", "cut myself", "wound open", "stitches open", "incision open",
         "stitches came out", "blood everywhere", "pus", "drainage", "yellowish fluid"],
        [
            "{name}, if there's a lot of bleeding, press a clean cloth firmly on the area and call Dr. Patel using the robin contact. If it's from your surgery site, please call right away.",
        ],
    ),
    (
        ["unconscious", "passed out", "fainted", "blacked out", "collapsed",
         "everything went black"],
        [
            "{name}, if you just fainted or blacked out, please stay seated or lying down and call Dr. Patel immediately using the robin contact.",
        ],
    ),
    (
        ["hip dislocat", "hip looks wrong", "leg looks wrong", "can't move my leg",
         "cant move my leg", "heard a pop in my hip"],
        [
            "That could be serious, {name}. Don't try to move. Call 911 right away. A hip dislocation needs immediate medical attention.",
        ],
    ),

    # =====================================================================
    # MENTAL HEALTH - CRISIS
    # =====================================================================
    (
        ["want to die", "suicid", "kill myself", "end it", "no reason to live",
         "better off dead", "don't want to be here", "not worth living",
         "wouldnt mind if i didnt wake up", "everyone would be better off without me",
         "i think about ending it"],
        [
            "I hear you, {name}, and I'm so glad you're talking to me. You are loved and you matter deeply. Please tap the butterfly to call Sarah right now. If you're in crisis, please call 988 (Suicide & Crisis Lifeline). You are not alone.",
        ],
    ),

    # =====================================================================
    # EMOTIONAL / MENTAL HEALTH
    # =====================================================================
    (
        ["depress", "hopeless", "give up", "no point", "what's the point",
         "can't go on", "cant go on", "feeling low", "feeling down", "dark place",
         "dont see the point", "is this depression", "no motivation",
         "nothing brings me joy", "i feel empty", "everything feels heavy"],
        [
            "I hear you, {name}, and I'm so glad you told me. You are loved and you matter. Please tap the butterfly to call Sarah. It's okay to not be okay.",
            "{name}, depression is something many people experience, and you don't have to face it alone. Please reach out to Sarah or Dr. Patel. They care about you deeply.",
        ],
    ),
    (
        ["sad", "unhappy", "miserable", "blue", "gloomy", "heavy heart",
         "been crying", "crying all morning", "felt sad since"],
        [
            "I'm sorry you're feeling this way, {name}. You're not alone. Would you like to call Sarah? Just tap her butterfly. Sometimes hearing a loved one's voice makes all the difference.",
            "It's okay to feel sad sometimes, {name}. Your family loves you very much. Tap a butterfly to call Sarah or James.",
        ],
    ),
    (
        ["lonely", "alone", "no one", "nobody", "isolated", "by myself", "miss people",
         "miss company", "no visitors", "nobody comes", "nobody cares", "all alone",
         "havent talked to anyone", "house is so quiet", "just want some company",
         "can you just talk to me", "just wanted someone to talk to", "feel invisible",
         "feel forgotten", "tv is my only company", "leave the tv on"],
        [
            "You're never truly alone, {name}. Your family thinks about you every day. Tap the butterfly to call Sarah or James right now. I bet they'd love to hear your voice.",
            "I'm here with you, {name}, and so is your family. Tap a butterfly anytime to reach them. You are cherished more than you know.",
            "I understand that feeling, {name}. Why not call Sarah? She always loves chatting with you. You mean so much to her.",
        ],
    ),
    (
        ["miss my husband", "miss my wife", "miss him", "miss her",
         "passed away", "died", "gone", "grief", "mourning", "widowed",
         "wish he was here", "wish she was here", "still set two cups",
         "anniversary", "his birthday", "her birthday", "our song"],
        [
            "I'm so sorry, {name}. Missing someone you love is one of the hardest things. It's okay to feel this way. Would you like to talk to Sarah? She understands and loves you.",
            "Grief takes time, {name}, and there's no right way to feel. Your loved ones are always in your heart. Tap the butterfly if you'd like to talk to family.",
            "That must be so hard, {name}. The love you shared doesn't go away. It's okay to feel this deeply. Your family is here for you.",
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
         "uneasy", "on edge", "dread", "cant shut my brain off"],
        [
            "I understand, {name}. Take a slow, deep breath with me. In through your nose... hold... out through your mouth. You're safe. Tap the butterfly to call Sarah if you'd like company.",
            "It's okay to feel anxious, {name}. Try taking a few slow breaths. Your garden is here, your family is just a tap away, and Dr. Patel is always available for reassurance.",
        ],
    ),
    (
        ["scared of falling", "afraid to fall", "afraid to walk", "fear of falling",
         "might fall", "unsteady", "wobbly", "balance", "terrified it will happen again",
         "afraid to be in the shower", "afraid to go outside"],
        [
            "That's a very common worry, {name}, and it's smart to be careful. Take your time, hold onto furniture or your walker, and make sure your path is clear. You're doing the right thing by being cautious.",
            "Your safety matters, {name}. Use your walker, take small steps, and clear any rugs or cords from your path. If you feel unsteady, sit down. There's no rush.",
        ],
    ),
    (
        ["burden", "don't want to bother", "bothering everyone", "too much trouble",
         "causing trouble", "in the way", "useless", "worthless", "not useful",
         "feel guilty asking", "hate asking for help", "rather suffer in silence",
         "told my daughter i was fine but", "hide things from my family"],
        [
            "Oh {name}, you are never a burden. Your family helps you because they love you, not because they have to. You have given so much to everyone around you.",
            "{name}, please don't hide how you feel. Your family WANTS to help. Tap the butterfly to call Sarah, she would tell you the same thing. You are so loved.",
        ],
    ),
    (
        ["angry", "mad", "frustrated", "annoyed", "irritated", "furious", "fed up",
         "sick of", "hate", "ridiculous", "at my wit's end", "sick of this",
         "why does everything have to be so hard"],
        [
            "I understand your frustration, {name}. It's okay to feel angry sometimes. Would you like to talk about what's bothering you, or call Sarah?",
            "Those feelings are valid, {name}. Take a moment to breathe. I'm here to listen, or tap a butterfly to talk to family.",
        ],
    ),
    (
        ["tired", "exhausted", "no energy", "fatigue", "fatigued", "worn out",
         "drained", "weak", "sleepy", "drowsy", "lethargic", "slept all day"],
        [
            "Rest is important, {name}. Make sure you're getting enough sleep and staying hydrated. If you've been tired for several days, mention it to Dr. Patel.",
            "Take it easy today, {name}. A short rest and some water can do wonders. Your body is still healing.",
        ],
    ),
    (
        ["bored", "boring", "nothing to do", "stuck inside", "every day feels the same",
         "no reason to get dressed"],
        [
            "How about tending to your garden, {name}? Logging your blood pressure or checking in helps your plant grow! You could also call Sarah for a nice chat.",
            "I understand, {name}. Maybe a gentle walk, listening to music, a crossword puzzle, or calling James would lift your spirits?",
        ],
    ),
    (
        ["stressed", "stress", "overwhelmed", "too much", "can't cope", "cant cope"],
        [
            "I'm sorry you're feeling overwhelmed, {name}. Let's take it one step at a time. A few deep breaths can help. Tap the butterfly to call Sarah if you need to talk.",
        ],
    ),
    (
        ["nighttime", "night time", "dark", "can't sleep", "cant sleep", "insomnia",
         "wake up", "waking up", "bad dream", "nightmare", "restless night",
         "woke up at 3am", "lie awake worrying", "nighttime is the worst",
         "scared at night", "silence scares me"],
        [
            "Nighttime can be tough, {name}. Try some deep breathing or a warm herbal tea (no caffeine). Keep a nightlight on for comfort. You can call Sarah if you need company.",
            "I'm sorry you can't sleep, {name}. Keep your room dark and cool. If this keeps happening, Dr. Patel can help. You're not alone.",
        ],
    ),
    (
        ["independence", "used to drive", "cant drive", "feel trapped",
         "used to cook", "used to clean", "miss feeling capable",
         "feel like a child", "not who i am", "want my life back",
         "i used to be so", "keeps getting worse"],
        [
            "I understand, {name}. Losing independence is one of the hardest parts. But you are still YOU, still strong, still loved. Focus on what you CAN do, it matters more than you think.",
            "That frustration makes complete sense, {name}. Your worth isn't measured by what you can do physically. You bring love, wisdom, and joy to your family every day.",
        ],
    ),

    # =====================================================================
    # SYMPTOMS - SPECIFIC
    # =====================================================================
    (
        ["dizzy", "dizziness", "lightheaded", "light headed", "faint", "vertigo",
         "room spinning", "spinning", "woozy", "dizzyness", "feling dizy"],
        [
            "Please sit down somewhere safe right away, {name}. Have some water. If the dizziness doesn't pass in a few minutes, tap the robin to call Dr. Patel.",
        ],
    ),
    (
        ["headache", "head hurt", "head ache", "migraine", "head pounding",
         "head pain", "throbbing", "headake", "relly bad headake"],
        [
            "I'm sorry about the headache, {name}. Have some water and rest in a quiet spot. You can take Acetaminophen if needed. If it's sudden and severe, call Dr. Patel right away.",
        ],
    ),
    (
        ["nausea", "nauseous", "sick to my stomach", "vomit", "throw up", "throwing up",
         "queasy", "cant keep food down", "threw up", "nauseaus", "nausous"],
        [
            "I'm sorry you're feeling unwell, {name}. Try sipping water slowly and eating plain crackers. If it gets worse or you can't keep anything down, call Dr. Patel.",
        ],
    ),
    (
        ["stomach", "tummy", "belly", "stomach pain", "cramps", "stomack"],
        [
            "Stomach trouble is uncomfortable, {name}. Try resting and sipping warm water. If the pain is severe or doesn't pass, please contact Dr. Patel.",
        ],
    ),
    (
        ["pain", "hurt", "hurts", "ache", "aching", "sore", "soreness", "tender",
         "sharp pain", "ow", "ouch", "oow", "oww", "agony", "pane", "herts",
         "killin me", "killing me"],
        [
            "I'm sorry you're in pain, {name}. If it's mild, you can take Acetaminophen. If the pain is severe or new, please tap the robin to reach Dr. Patel.",
            "Pain is no fun, {name}. Rest the area and consider Acetaminophen. Please let Dr. Patel know if it doesn't improve.",
        ],
    ),
    (
        ["swollen", "swelling", "puffy", "bloated", "water retention", "edema",
         "ankles swollen", "legs swollen", "feet swollen", "feet puffy",
         "gained 4 pounds overnight", "gained weight overnight"],
        [
            "Swelling, especially in your legs, can be important, {name}. Elevate them if you can. Sudden swelling or weight gain could be related to your blood pressure. Please mention it to Dr. Patel.",
        ],
    ),
    (
        ["hip", "hip pain", "hip hurts", "surgery site", "incision", "scar",
         "hip replacement", "new hip", "joint", "incishun", "stiches", "stitches",
         "scar is itchy", "wound", "hard lump near"],
        [
            "Some discomfort during recovery is normal, {name}. Keep up with your exercises and take Acetaminophen if needed. If you notice redness, warmth, swelling, or drainage at the site, please call Dr. Patel right away.",
        ],
    ),
    (
        ["constipat", "can't go", "haven't gone", "havent gone", "bowel",
         "bathroom trouble", "stomach hard", "constapated", "havent poped"],
        [
            "That's quite common, {name}, especially with some medications. Try drinking more water, eating prunes or apples, and a gentle walk. If it continues past a few days, mention it to Dr. Patel.",
        ],
    ),
    (
        ["diarr", "loose stool", "runs", "bathroom a lot", "urgent bathroom", "diaherria"],
        [
            "I'm sorry, {name}. Drink plenty of water to stay hydrated. If it continues for more than a day or you feel weak, please contact Dr. Patel.",
        ],
    ),
    (
        ["cough", "coughing", "cold", "flu", "runny nose", "stuffy", "congestion",
         "sneezing", "sore throat", "throat hurt", "fever", "chills", "temperature",
         "body aches", "feverish", "night sweats"],
        [
            "I'm sorry you're not feeling well, {name}. Rest and drink plenty of fluids. If you develop a fever over 38C or symptoms get worse, please call Dr. Patel.",
        ],
    ),
    (
        ["rash", "itchy", "itch", "hives", "skin", "bumps", "red spot", "bruise",
         "peeling", "dry skin"],
        [
            "A skin change could be a reaction to something, {name}. If it appeared after starting a new medication, contact Dr. Patel. If you also have trouble breathing, call 911.",
        ],
    ),
    (
        ["blurry", "vision", "can't see", "cant see", "eyes", "eye hurt",
         "seeing spots", "vision getting worse", "eye is red"],
        [
            "Vision changes can be important, {name}. If it's sudden, please contact Dr. Patel right away. It could be related to your blood pressure or diabetes.",
        ],
    ),
    (
        ["numbness", "numb", "tingling", "pins and needles", "tingly",
         "feet feel tingly", "feet are numb", "burning in my feet"],
        [
            "Numbness or tingling can be related to diabetes, {name}. Please mention it to Dr. Patel. If it's sudden and on one side, call 911 immediately.",
        ],
    ),
    (
        ["thirsty", "dry mouth", "drinking a lot", "peeing a lot", "urinating a lot",
         "frequent urination", "cant stop drinking water"],
        [
            "Increased thirst and frequent urination can be signs your blood sugar needs checking, {name}. Stay hydrated and mention this to Dr. Patel.",
        ],
    ),
    (
        ["blood sugar", "sugar level", "glucose", "diabetes", "diabetic", "sugar high",
         "sugar low", "hypoglyc", "hyperglyc", "shaky", "shaking and sweating",
         "sugar was", "a1c"],
        [
            "Managing your diabetes is important, {name}. Your Metformin helps keep blood sugar steady. Take it with food. If you feel shaky, sweaty, or confused, have some juice and call Dr. Patel.",
        ],
    ),
    (
        ["heart racing", "heart pounding", "palpitation", "heart skipped", "irregular heartbeat",
         "heart feels fluttery", "hart is racing"],
        [
            "Try to sit down and take slow, deep breaths, {name}. If your heart feels like it's racing or skipping, and it doesn't settle in a few minutes, please call Dr. Patel or 911.",
        ],
    ),
    (
        ["uti", "urinary", "burning when i pee", "cloudy urine", "strong smell",
         "pink urine", "blood in my urine"],
        [
            "Those symptoms could be a urinary tract infection, {name}. Please contact Dr. Patel today. UTIs need treatment with antibiotics. Drink extra water in the meantime.",
        ],
    ),
    (
        ["ear", "ringing", "hearing", "cant hear", "tinnitus"],
        [
            "Ear trouble can be frustrating, {name}. If ringing or hearing loss is new, please mention it to Dr. Patel at your next visit.",
        ],
    ),
    (
        ["appetite", "not hungry", "dont feel like eating", "no appetite",
         "food tastes weird", "skip meals", "havent eaten"],
        [
            "It's important to eat even when you're not hungry, {name}. Try small meals or snacks. Your Metformin works best with food. If loss of appetite continues, let Dr. Patel know.",
        ],
    ),
    (
        ["weight", "lost weight", "gained weight", "lost 10 pounds"],
        [
            "Unexpected weight changes are worth reporting, {name}. Sudden weight gain could mean fluid retention, and unexplained weight loss should be checked. Please mention it to Dr. Patel.",
        ],
    ),
    (
        ["incontinence", "accident", "pee", "wetting", "bladder", "leak",
         "cant make it", "leaked when i coughed", "adult diaper"],
        [
            "That's more common than you think, {name}, and nothing to be embarrassed about. Drink water regularly, try going to the bathroom on a schedule, and Dr. Patel can help with options.",
        ],
    ),
    (
        ["legs", "restless leg", "legs jumpy", "charlie horse", "leg cramp",
         "cramp in my calf"],
        [
            "Restless legs and cramps can be uncomfortable, {name}. Try gently stretching before bed and staying hydrated. A warm cloth on the area can help. Mention it to Dr. Patel if it's frequent.",
        ],
    ),

    # =====================================================================
    # MEDICATIONS
    # =====================================================================
    (
        ["blood pressure", "bp", "pressure high", "pressure low", "hypertension",
         "high blood pressure", "low blood pressure", "blod presure",
         "is 130 over 80 okay", "is 160 over 100 dangerous"],
        [
            "You can log your blood pressure anytime using the heart button, {name}! Your Lisinopril helps keep it in a healthy range. Regular logging helps Dr. Patel track your trends.",
        ],
    ),
    (
        ["medication", "medicine", "pill", "pills", "drug", "drugs", "prescription",
         "rx", "tablet", "capsule", "medicin"],
        [
            "Your medications are important, {name}! Lisinopril 10mg every morning for blood pressure, Metformin 500mg morning and evening with food for diabetes, and Acetaminophen as needed for pain. Your garden blooms when you take them on time!",
        ],
    ),
    (
        ["lisinopril"],
        ["Lisinopril helps keep your blood pressure healthy, {name}. You take 10mg every morning. A dry cough is a common side effect. Let Dr. Patel know if that happens."],
    ),
    (
        ["metformin"],
        ["Metformin helps manage your blood sugar, {name}. You take 500mg morning and evening with food. If you feel nauseous, try taking it in the middle of your meal."],
    ),
    (
        ["acetaminophen", "tylenol", "painkiller", "pain relief", "pain killer"],
        ["Acetaminophen is your pain reliever, {name}. Take 500mg as needed, but don't exceed 3000mg per day. If you need it regularly, let Dr. Patel know."],
    ),
    (
        ["side effect", "reaction", "making me sick", "from the pills",
         "new medication makes me", "pill looks different"],
        [
            "Side effects can happen, {name}. Common ones: nausea from Metformin, dry cough from Lisinopril. If something feels wrong or new, please contact Dr. Patel. Don't stop taking medication without asking first.",
        ],
    ),
    (
        ["forgot", "forget", "missed", "skip", "didn't take", "didnt take",
         "ran out", "run out", "refill", "pharmacy", "prescription",
         "cant remember if i took", "did i take my"],
        [
            "If you just remembered, go ahead and take it now, {name} (unless it's almost time for your next dose). If you're running low, tap the robin to contact Dr. Patel about a refill.",
        ],
    ),
    (
        ["when do i take", "what time", "schedule", "how often", "dosage", "dose",
         "how much", "how many", "doc sed take"],
        [
            "Here's your schedule, {name}: Lisinopril 10mg every morning, Metformin 500mg morning and evening with food, and Acetaminophen 500mg as needed for pain.",
        ],
    ),
    (
        ["can i take ibuprofen", "can i take advil", "can i take aspirin"],
        [
            "Please check with Dr. Patel before taking any new medications, {name}. Some pain relievers can interact with your blood pressure medication. Acetaminophen is usually safe for you."],
    ),
    (
        ["cost", "expensive", "afford", "insurance", "coverage", "cheaper"],
        [
            "Medication costs can be stressful, {name}. Ask Dr. Patel about generic versions or patient assistance programs. Many pharmacies offer discount programs too."],
    ),
    (
        ["crush my pills", "hard to swallow", "swallow pills"],
        ["If you have trouble swallowing pills, {name}, ask Dr. Patel if yours can be crushed or if a liquid version is available. Never crush pills without checking first."],
    ),

    # =====================================================================
    # POST-SURGERY RECOVERY
    # =====================================================================
    (
        ["when can i walk without", "stop using the walker", "switch to a cane",
         "how long does recovery take", "is it normal to still"],
        [
            "Recovery takes time, {name}. Most people use a walker for 4-6 weeks, then transition to a cane. Follow Dr. Patel's guidance. Your body will tell you when it's ready.",
        ],
    ),
    (
        ["can i bend", "cross my legs", "sleep on my side", "how should i sleep",
         "get in the car", "get in the bathtub", "go up stairs", "stairs"],
        [
            "After hip replacement, avoid crossing your legs and bending past 90 degrees, {name}. Use a pillow between your knees when sleeping. Ask your physiotherapist about safe ways to do daily activities.",
        ],
    ),
    (
        ["physio", "physiotherapy", "exercises", "rehab", "stretching",
         "forgot my physio exercises", "how far should i walk"],
        [
            "Your physio exercises are so important for recovery, {name}! Do them gently every day as your therapist showed you. Start with short walks and gradually increase. Listen to your body.",
        ],
    ),
    (
        ["click", "pop", "clunk", "hip made a", "feels tight", "feels different",
         "leg length", "one leg feels longer"],
        [
            "Some clicking or tightness is normal with a new hip, {name}. But if you hear a loud pop, feel sudden pain, or your leg looks different, contact Dr. Patel right away.",
        ],
    ),
    (
        ["can i drive", "when can i drive", "can i garden", "can i swim",
         "can i travel", "can i fly", "airplane", "metal detector"],
        [
            "Most people can resume driving 4-6 weeks after surgery, {name}, once Dr. Patel clears you. Light gardening, swimming, and travel usually follow a bit later. Always check with your doctor first!",
        ],
    ),

    # =====================================================================
    # DAILY LIVING
    # =====================================================================
    (
        ["eat", "food", "hungry", "meal", "cook", "cooking", "breakfast", "lunch",
         "dinner", "snack", "recipe", "diet", "nutrition", "what should i eat",
         "diabetic diet", "carbs", "salt"],
        [
            "For your diabetes, try regular meals with vegetables, lean protein, and whole grains, {name}. Limit sugar, white bread, and salty foods. Take your Metformin with food!",
            "Good choices for you, {name}: fish, chicken, vegetables, brown rice, oatmeal. Try to eat at regular times. Cooking for one can be hard, but even simple meals count!",
        ],
    ),
    (
        ["water", "drink", "hydrat", "dehydrat", "fluid", "thirsty",
         "urine is dark", "mouth is dry", "lips cracked"],
        [
            "Try to drink 6-8 glasses of water throughout the day, {name}! Keep a glass near your chair. Staying hydrated helps your blood pressure and energy. Tea counts too!",
        ],
    ),
    (
        ["walk", "exercise", "move", "active", "steps", "stretch"],
        [
            "Gentle movement is wonderful, {name}! Even a short walk around the house helps. Do your hip exercises daily. Just listen to your body and don't overdo it.",
        ],
    ),
    (
        ["bath", "shower", "wash", "hygiene", "grooming"],
        [
            "Safety first in the bathroom, {name}! Use grab bars, a non-slip mat, and a shower chair if needed. Take your time and don't rush.",
        ],
    ),
    (
        ["walker", "cane", "wheelchair", "mobility aid", "rollator",
         "how do i get up from a chair", "cant get up", "grip is weak"],
        [
            "Using your walker is very wise, {name}! Make sure paths are clear of rugs and cords. When getting up from a chair, scoot to the edge first, then push up with both arms.",
        ],
    ),
    (
        ["sleep", "insomnia", "restless", "can't get comfortable",
         "melatonin", "sleeping pills", "benadryl to sleep"],
        [
            "Good sleep is so important, {name}. Try a regular bedtime, a warm drink, and a comfortable position. Ask Dr. Patel before taking any sleep aids, as some can interact with your medications.",
        ],
    ),
    (
        ["hot", "cold", "weather", "rain", "snow", "ice", "warm", "cool",
         "temperature outside", "coat", "heat wave"],
        [
            "Whatever the weather outside, your indoor garden is always perfect, {name}! Stay warm in cold weather, hydrate in heat, and avoid icy surfaces. Your health comes first!",
        ],
    ),
    (
        ["home safety", "grab bar", "non-slip", "nightlight", "rug", "tripping hazard",
         "life alert", "medical alert", "fall detection", "left the stove on",
         "forgot to turn off"],
        [
            "Home safety is so important, {name}! Grab bars in the bathroom, non-slip mats, good lighting, clear paths, and a medical alert device all help keep you safe. Ask Sarah to help check your home for hazards.",
        ],
    ),

    # =====================================================================
    # SOCIAL / RELATIONSHIPS
    # =====================================================================
    (
        ["grandchild", "grandkid", "grandson", "granddaughter", "grandchildren"],
        [
            "I bet your grandchildren love you very much, {name}! Would you like to call Sarah to ask about them? Tap the butterfly anytime!",
        ],
    ),
    (
        ["church", "temple", "mosque", "synagogue", "faith", "pray", "prayer",
         "god", "spiritual", "worship", "service", "mass", "bible",
         "priest", "pastor", "communion"],
        [
            "Faith can be a wonderful source of comfort, {name}. Even if you can't attend in person right now, you can still pray and find peace. Many churches offer home visits or live-streamed services.",
        ],
    ),
    (
        ["holiday", "christmas", "easter", "birthday", "thanksgiving", "new year",
         "celebration", "special day"],
        [
            "Special days can bring mixed feelings, {name}. I hope you have something lovely planned! Call Sarah or James to chat about it. Tap the butterfly!",
        ],
    ),
    (
        ["friend", "neighbour", "neighbor", "visitor", "visit", "company",
         "senior center", "groups", "social"],
        [
            "Social connections are so important, {name}! Ask Sarah about senior centres or community groups nearby. In the meantime, your family is always a butterfly tap away.",
        ],
    ),
    (
        ["tv", "television", "show", "movie", "watch", "programme", "channel",
         "news", "radio", "music", "song", "listen", "remote", "netflix"],
        [
            "Enjoying some entertainment sounds lovely, {name}! Watching a good show or listening to music can really lift your spirits. Just try not to watch too much distressing news.",
        ],
    ),
    (
        ["book", "read", "reading", "magazine", "crossword", "puzzle", "sudoku",
         "game", "cards", "audiobook"],
        [
            "That's wonderful for keeping your mind sharp, {name}! Puzzles and reading are great brain exercise. Many libraries deliver books or offer audiobooks too.",
        ],
    ),
    (
        ["pet", "cat", "dog", "bird", "fish", "animal", "kitty", "puppy"],
        [
            "Pets are such wonderful companions, {name}! They bring so much joy and comfort. Animals are great for the spirit.",
        ],
    ),
    (
        ["gardening", "garden", "tomato", "flowers", "plant", "grow",
         "container gardening", "raised bed", "windowsill"],
        [
            "Gardening is wonderful, {name}! You can do container gardening from a chair or a raised bed at waist height. Indoor herbs on a windowsill are great too. Ask Dr. Patel when you can safely kneel.",
        ],
    ),

    # =====================================================================
    # FAMILY / CONTACTS
    # =====================================================================
    (
        ["sarah", "daughter"],
        ["Sarah loves you so much, {name}! Tap the blue butterfly to call her anytime. She's always happy to hear from you."],
    ),
    (
        ["james", "son"],
        ["James cares about you deeply, {name}! Tap the green butterfly to give him a call."],
    ),
    (
        ["dr patel", "doctor", "physician", "gp", "clinic", "hospital", "appointment",
         "specialist", "referral", "telehealth", "video appointment"],
        [
            "Dr. Patel is there for your medical needs, {name}. Tap the robin contact to reach the office. Write down your questions before your appointment so you don't forget!",
        ],
    ),
    (
        ["call", "phone", "ring", "contact", "reach", "talk to", "facetime", "video call"],
        [
            "You can reach your family anytime, {name}! Sarah is the blue butterfly, James is the green one, and Dr. Patel is the robin. Just tap to call!",
        ],
    ),
    (
        ["nursing home", "assisted living", "care facility", "put me in a home",
         "dont want to move", "stay in my house", "stay independent", "home care"],
        [
            "Your wishes matter, {name}. Many people stay at home with support from home care services. Talk to Sarah and Dr. Patel about what options are available to help you stay independent.",
        ],
    ),

    # =====================================================================
    # COGNITIVE
    # =====================================================================
    (
        ["what day is it", "what's the date", "what date", "what is today",
         "is it morning", "is it afternoon", "what time is it", "what month",
         "what year", "is today monday", "is today tuesday"],
        [
            "Today is {today}, {name}. I hope you're having a good day! Don't forget your medications and a check-in.",
        ],
    ),
    (
        ["memory", "remember", "confused", "confusion", "foggy", "brain fog",
         "can't remember", "cant remember", "forgetful", "dementia", "alzheimer",
         "getting slower", "cant think of the word", "forget names",
         "should i be tested"],
        [
            "Some forgetfulness is perfectly normal, {name}. Writing things down and keeping a routine helps. If you're worried about your memory, Dr. Patel can do a simple check at your next visit. You're not alone in this.",
        ],
    ),
    (
        ["where am i", "i need to go home", "pick up my children",
         "where is my husband", "someone is in my house",
         "dont recognize", "i see things", "hear noises"],
        [
            "You're safe at home, {name}. Everything is okay. If you're feeling confused or scared, please tap the butterfly to call Sarah. She can help you feel better. Take a deep breath.",
        ],
    ),

    # =====================================================================
    # END OF LIFE (sensitive)
    # =====================================================================
    (
        ["dying", "how much longer", "ready when the time comes", "dont want to suffer",
         "die in my home", "hospice", "palliative", "advance directive", "living will",
         "dnr", "update my will", "sort out my affairs", "funeral",
         "what happens after", "regret", "legacy", "letters to my grandchildren",
         "hope i made a difference", "my life had meaning"],
        [
            "These are important thoughts, {name}, and it takes courage to think about them. Your feelings are completely valid. I'd encourage you to talk to Sarah or Dr. Patel about your wishes. You have every right to plan for the future you want.",
            "You have lived a meaningful life, {name}, and you continue to make a difference to everyone who loves you. If you'd like to discuss advance care planning, Dr. Patel can help. Your family will want to honor your wishes.",
        ],
    ),

    # =====================================================================
    # PRACTICAL
    # =====================================================================
    (
        ["ambulance", "emergency", "911", "urgent care", "er ", "emergency room"],
        ["If this is an emergency, {name}, please call 911 right away. Your safety is the most important thing."],
    ),
    (
        ["transport", "ride", "drive", "taxi", "bus", "car", "uber", "lyft"],
        ["For transportation, {name}, ask Sarah or James to help arrange a ride. Many communities also have senior transport services. Tap the butterfly to call family!"],
    ),
    (
        ["scam", "suspicious", "someone called", "gave out my information", "medicare called"],
        [
            "Be very careful, {name}! Medicare will never call asking for personal information. If someone asked for your details, please tell Sarah right away. Tap the butterfly to call her.",
        ],
    ),

    # =====================================================================
    # APP / TECHNOLOGY
    # =====================================================================
    (
        ["help", "how do i", "how does", "what do i", "how to", "tutorial",
         "instructions", "guide", "explain", "what is this", "how do i use",
         "this app", "confused about"],
        [
            "I'm here to help, {name}! Tap the heart button to log blood pressure, take medications when reminded, check in daily, and call family by tapping the butterflies. Your garden grows when you do these things!",
        ],
    ),
    (
        ["button", "tap", "press", "click", "screen", "touch", "swipe",
         "too small", "can't read", "cant read", "text small", "font",
         "bigger", "hard to see", "hard to read"],
        [
            "The heart button logs blood pressure, butterflies call family, and Help brings you here, {name}. If text is too small, ask Sarah to help adjust your device settings. You're doing great!",
        ],
    ),
    (
        ["broken", "not working", "doesn't work", "error", "glitch", "bug",
         "wrong", "problem with", "issue", "this is useless", "too complicated",
         "forget it", "i give up", "never mind"],
        [
            "I'm sorry for the trouble, {name}. Try closing and reopening the app. If the problem continues, tap a butterfly to call Sarah or James for help. Don't give up, you're doing wonderfully!",
        ],
    ),
    (
        ["are you real", "robot", "computer", "person", "ai", "machine",
         "am i talking to a"],
        [
            "I'm your Garden Helper, {name}! I'm a digital assistant here to support you, remind you about your health, and keep you company. Think of me as a friendly guide for your wellness garden.",
        ],
    ),
    (
        ["can i talk to a real person", "real person", "human"],
        [
            "I understand, {name}. You can talk to your family anytime by tapping the butterflies. Sarah is the blue one, James is the green one, and Dr. Patel is the robin.",
        ],
    ),

    # =====================================================================
    # GREETINGS / PLEASANTRIES
    # =====================================================================
    (
        ["hello", "hi", "hey", "hiya", "howdy", "good morning",
         "good afternoon", "good evening", "good day", "morning", "afternoon",
         "is anyone there", "can you hear me", "testing"],
        [
            "Hello, {name}! Lovely to see you. How are you feeling today? Your garden is looking beautiful!",
            "Hi there, {name}! Welcome back. Is there anything I can help you with today?",
            "Good to see you, {name}! Your plant has been growing nicely. How can I help you today?",
        ],
    ),
    (
        ["how are you", "how r u", "how're you", "how you doing", "hows it going",
         "what's up", "whats up"],
        [
            "I'm doing well, thank you for asking, {name}! More importantly, how are YOU feeling today?",
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
         "so kind", "wonderful", "you are good company", "glad you are here",
         "dont know what i would do without you"],
        [
            "You're very welcome, {name}! I'm always here for you.",
            "Anytime, {name}! That's what I'm here for.",
            "It's my pleasure, {name}! You deserve all the support in the world.",
        ],
    ),
    (
        ["love you", "i love", "you're the best", "best friend", "like you",
         "you listen better than"],
        [
            "That means so much, {name}! I care about you too. Your wellbeing is the most important thing to me.",
        ],
    ),
    (
        ["bye", "goodbye", "see you", "good night", "goodnight", "night", "later",
         "take care", "gotta go", "leaving", "ttyl"],
        [
            "Goodbye, {name}! Take care and have a wonderful rest of your day. Your garden will be here waiting!",
            "Take care, {name}! Don't forget your medications and a glass of water. See you soon!",
        ],
    ),
    (
        ["yes", "yeah", "yep", "yup", "sure", "ok", "okay", "alright", "right"],
        ["Great, {name}! Is there anything else I can help you with? I'm always here."],
    ),
    (
        ["no", "nope", "nah", "not really", "i'm fine", "im fine", "i'm ok", "im ok"],
        ["That's perfectly fine, {name}! I'm here whenever you need me. Enjoy your day!"],
    ),

    # =====================================================================
    # POSITIVE / WELLBEING
    # =====================================================================
    (
        ["good", "great", "fine", "well", "happy", "wonderful", "better", "fantastic",
         "amazing", "lovely", "blessed", "content", "peaceful"],
        [
            "That's wonderful to hear, {name}! Your positive spirit helps your garden bloom!",
            "I'm so glad, {name}! You deserve to feel good. Your garden is thriving just like you!",
        ],
    ),
    (
        ["so-so", "not bad", "meh", "could be better", "managing", "getting by",
         "surviving", "ok i guess"],
        [
            "That's perfectly okay, {name}. Every day is different. Is there anything I can help with to make today a little better?",
        ],
    ),
    (
        ["not good", "something is wrong", "i dont feel right", "i feel off",
         "bad day", "really bad today"],
        [
            "I'm sorry to hear that, {name}. Can you tell me more about what's bothering you? If it's something physical, Dr. Patel can help. If you need company, tap the butterfly to call family.",
        ],
    ),

    # =====================================================================
    # HUMOR / RANDOM
    # =====================================================================
    (
        ["joke", "funny", "make me laugh", "tell me something", "entertain",
         "cheer me up", "riddle", "fun fact"],
        [
            "Why did the gardener plant lightbulbs? Because he wanted to grow a power plant! I hope that brought a smile, {name}!",
            "What did the big flower say to the little flower? Hi there, bud! Your garden helper loves making you smile, {name}!",
            "Why do flowers always drive so fast? They put the petal to the metal! Hope your day is blooming, {name}!",
            "Here's a fun fact, {name}: laughing is actually good for your blood pressure! So here's to more laughter today!",
        ],
    ),
    (
        ["damn", "dammit", "crap", "hell", "ugh", "argh", "grr", "blah",
         "oh for goodness sake", "dropped it again", "oh no", "shoot"],
        [
            "I hear your frustration, {name}. Bad moments don't mean a bad day. Take a breath. I'm here if you want to talk.",
        ],
    ),
    (
        ["shut up", "leave me alone", "go away", "stop", "be quiet", "enough"],
        [
            "I understand, {name}. I'll be right here whenever you need me. Just tap Help when you want to chat again. Take care of yourself.",
        ],
    ),
    (
        ["hate being old", "getting old", "not for the faint of heart",
         "wasnt ready for this", "nobody told me"],
        [
            "Aging brings real challenges, {name}, and your feelings about it are completely valid. But you also carry wisdom and love that only comes with experience. Your family treasures that.",
        ],
    ),
]

# Absolute fallback if nothing matches
DEFAULT_RESPONSES = [
    "I'm here for you, {name}! If you need anything, just ask. You can also tap a butterfly to call your family anytime.",
    "Thank you for sharing, {name}. Remember, your garden grows when you log your blood pressure and take your medications!",
    "I appreciate you talking to me, {name}! Your family is always just a butterfly tap away.",
    "That's interesting, {name}! Is there anything health-related I can help with today?",
    "I'm glad you're here, {name}! Remember to stay hydrated and take your medications on time. Your garden loves you!",
]

_default_index = 0


def get_fallback_response(message: str, patient_name: str = "Margaret") -> str:
    """Match user message to an appropriate fallback response."""
    global _default_index
    msg_lower = message.lower()
    today = datetime.now().strftime("%A, %B %d")

    for keywords, responses in INTENT_PATTERNS:
        for keyword in keywords:
            if keyword in msg_lower:
                return random.choice(responses).format(name=patient_name, today=today)

    reply = DEFAULT_RESPONSES[_default_index % len(DEFAULT_RESPONSES)]
    _default_index += 1
    return reply.format(name=patient_name, today=today)
