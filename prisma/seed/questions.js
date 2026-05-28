async function seedVocabularyQuestions(prisma) {
  const questionSeeds = [
    // Numbers (1-10)
    {
      level: "A1",
      question: "Which is the number five?",
      options: { A: "3", B: "5", C: "7", D: "9" },
      answer: "B",
      skill: "vocabulary",
    },
    // Colors
    {
      level: "A1",
      question: "What color is the sky on a sunny day?",
      options: { A: "Red", B: "Green", C: "Blue", D: "Yellow" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "What is the color of snow?",
      options: { A: "Black", B: "White", C: "Gray", D: "Brown" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Which color is like fire?",
      options: { A: "Red", B: "Yellow", C: "Orange", D: "Purple" },
      answer: "A",
      skill: "vocabulary",
    },
    // Body parts
    {
      level: "A1",
      question: "How many fingers do you have on one hand?",
      options: { A: "3", B: "5", C: "7", D: "10" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "What is at the top of your body?",
      options: { A: "Head", B: "Hand", C: "Foot", D: "Arm" },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You walk with your ____.",
      options: { A: "Hand", B: "Head", C: "Feet", D: "Eye" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You see with your ____.",
      options: { A: "Hand", B: "Eye", C: "Ear", D: "Nose" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You hear with your ____.",
      options: { A: "Eye", B: "Hand", C: "Ear", D: "Mouth" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You speak with your ____.",
      options: { A: "Hand", B: "Eye", C: "Mouth", D: "Ear" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You smell with your ____.",
      options: { A: "Nose", B: "Eye", C: "Ear", D: "Hand" },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Your heart is inside your ____.",
      options: { A: "Head", B: "Arm", C: "Chest", D: "Leg" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You think with your ____.",
      options: { A: "Heart", B: "Head", C: "Hand", D: "Foot" },
      answer: "B",
      skill: "vocabulary",
    },
    // Common nouns - Furniture
    {
      level: "A1",
      question: "What do you sit on?",
      options: { A: "Table", B: "Chair", C: "Door", D: "Window" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Where do you sleep?",
      options: { A: "Bed", B: "Chair", C: "Table", D: "Desk" },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "What do you eat on?",
      options: { A: "Chair", B: "Door", C: "Plate", D: "Wall" },
      answer: "C",
      skill: "vocabulary",
    },
    // Family
    {
      level: "A1",
      question: "Your mother's mother is your ____.",
      options: { A: "Sister", B: "Aunt", C: "Grandmother", D: "Cousin" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Your father is your parent. Is your mother also a parent?",
      options: { A: "No", B: "Yes", C: "Maybe", D: "I don't know" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "I have a brother. He is my ____.",
      options: { A: "Brother", B: "Sister", C: "Father", D: "Mother" },
      answer: "A",
      skill: "vocabulary",
    },
    // Animals
    {
      level: "A1",
      question: "What animal says 'meow'?",
      options: { A: "Dog", B: "Cat", C: "Cow", D: "Bird" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "What animal says 'woof'?",
      options: { A: "Cat", B: "Bird", C: "Dog", D: "Fish" },
      answer: "C",
      skill: "vocabulary",
    },
    // Food & Drink
    {
      level: "A1",
      question: "What is a common breakfast food?",
      options: { A: "Dinner", B: "Lunch", C: "Bread", D: "Supper" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "What do you drink when you are thirsty?",
      options: { A: "Food", B: "Water", C: "Milk", D: "Juice" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Which is a fruit?",
      options: { A: "Car", B: "Banana", C: "Chair", D: "Plate" },
      answer: "B",
      skill: "vocabulary",
    },
    // Professions
    {
      level: "A1",
      question: "A ____ teaches students in a school.",
      options: { A: "Doctor", B: "Teacher", C: "Cook", D: "Driver" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "A ____ helps sick people.",
      options: { A: "Teacher", B: "Driver", C: "Doctor", D: "Cook" },
      answer: "C",
      skill: "vocabulary",
    },
    // Transportation
    {
      level: "A1",
      question: "What do you ride to go to school?",
      options: { A: "Bus", B: "House", C: "Tree", D: "School" },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "A car has four ____.",
      options: { A: "Doors", B: "Wheels", C: "Engines", D: "Seats" },
      answer: "B",
      skill: "vocabulary",
    },
    // Clothing
    {
      level: "A1",
      question: "What do you wear on your feet?",
      options: { A: "Hat", B: "Shirt", C: "Shoes", D: "Pants" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "What do you wear on your head?",
      options: { A: "Shoes", B: "Hat", C: "Shirt", D: "Pants" },
      answer: "B",
      skill: "vocabulary",
    },
    // Weather
    {
      level: "A1",
      question: "What do you use when it rains?",
      options: { A: "Hat", B: "Glasses", C: "Umbrella", D: "Gloves" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "When there are clouds, the weather is ____.",
      options: { A: "Sunny", B: "Cloudy", C: "Rainy", D: "Snowy" },
      answer: "B",
      skill: "vocabulary",
    },
    // Time
    {
      level: "A1",
      question: "What meal comes after breakfast?",
      options: { A: "Dinner", B: "Lunch", C: "Supper", D: "Snack" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "How many days are in a week?",
      options: { A: "5", B: "6", C: "7", D: "8" },
      answer: "C",
      skill: "vocabulary",
    },
    // School objects
    {
      level: "A1",
      question: "You write with a ____.",
      options: { A: "Pen", B: "Book", C: "Desk", D: "Door" },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You read a ____.",
      options: { A: "Pen", B: "Book", C: "Pencil", D: "Paper" },
      answer: "B",
      skill: "vocabulary",
    },
    // Simple verbs context
    {
      level: "A1",
      question: "When you are not awake, you are ____.",
      options: { A: "Running", B: "Sleeping", C: "Eating", D: "Walking" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "When you are happy, you ____.",
      options: { A: "Cry", B: "Smile", C: "Sleep", D: "Sit" },
      answer: "B",
      skill: "vocabulary",
    },
    // Rooms
    {
      level: "A1",
      question: "Where do you cook food?",
      options: { A: "Bedroom", B: "Kitchen", C: "Living room", D: "Bathroom" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "You take a bath in the ____.",
      options: { A: "Kitchen", B: "Bedroom", C: "Bathroom", D: "Living room" },
      answer: "C",
      skill: "vocabulary",
    },
    // Locations
    {
      level: "A1",
      question: "Where do you live?",
      options: { A: "House", B: "School", C: "Park", D: "Street" },
      answer: "A",
      skill: "vocabulary",
    },
    // Common adjectives
    {
      level: "A1",
      question: "Is ice cold or hot?",
      options: { A: "Hot", B: "Warm", C: "Cold", D: "Cool" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Fire is ____.",
      options: { A: "Cold", B: "Hot", C: "Cool", D: "Warm" },
      answer: "B",
      skill: "vocabulary",
    },
    // More common objects
    {
      level: "A1",
      question: "My ____ has pages with stories and pictures.",
      options: { A: "Pen", B: "Book", C: "Desk", D: "Bag" },
      answer: "B",
      skill: "vocabulary",
    },
    // Sports/Activities
    {
      level: "A1",
      question: "You ____ a ball in sports.",
      options: { A: "Read", B: "Play", C: "Sit", D: "Sleep" },
      answer: "B",
      skill: "vocabulary",
    },
    // Containers
    {
      level: "A1",
      question: "You drink from a ____.",
      options: { A: "Plate", B: "Cup", C: "Spoon", D: "Fork" },
      answer: "B",
      skill: "vocabulary",
    },
    // Tools
    {
      level: "A1",
      question: "You cut with a ____.",
      options: { A: "Spoon", B: "Fork", C: "Knife", D: "Plate" },
      answer: "C",
      skill: "vocabulary",
    },
    // Greeting
    {
      level: "A1",
      question: "How do you greet someone in the morning?",
      options: { A: "Good morning", B: "Good night", C: "Hello", D: "Goodbye" },
      answer: "A",
      skill: "vocabulary",
    },
    // Plurals
    {
      level: "A1",
      question: "One cat, two ____.",
      options: { A: "cats", B: "cat", C: "catt", D: "cates" },
      answer: "A",
      skill: "vocabulary",
    },
    // Nature
    {
      level: "A1",
      question: "A ____ is very tall and has leaves.",
      options: { A: "Flower", B: "Grass", C: "Tree", D: "Rock" },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The athlete was ____ to win the gold medal after years of hard training.",
      options: {
        A: "determined",
        B: "cautious",
        C: "relaxed",
        D: "doubtful",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "It is ____ that we arrive on time for the meeting, or we will miss the presentation.",
      options: {
        A: "optional",
        B: "essential",
        C: "possible",
        D: "fortunate",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The loud noise in the street ____ my concentration while I was studying.",
      options: {
        A: "interrupted",
        B: "improved",
        C: "supported",
        D: "arranged",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "After the argument, they decided to ____ their differences and become friends again.",
      options: {
        A: "ignore",
        B: "solve",
        C: "settle",
        D: "choose",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The company decided to ____ its prices to attract more customers.",
      options: {
        A: "reduce",
        B: "develop",
        C: "increase",
        D: "maintain",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She felt ____ when she realized she had left her phone on the bus.",
      options: {
        A: "proud",
        B: "frustrated",
        C: "patient",
        D: "satisfied",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The documentary provided a ____ account of the historical events.",
      options: {
        A: "detailed",
        B: "imaginary",
        C: "hidden",
        D: "brief",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He needs to ____ his bad habits if he wants to stay healthy.",
      options: {
        A: "give up",
        B: "take up",
        C: "look up",
        D: "make up",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The new manager is very ____; she always listens to her employees' ideas.",
      options: {
        A: "strict",
        B: "approachable",
        C: "distant",
        D: "serious",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "I don't ____ with your opinion, but I respect your right to say it.",
      options: {
        A: "agree",
        B: "accept",
        C: "believe",
        D: "admit",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The weather forecast said it would be ____ to rain later this afternoon.",
      options: {
        A: "likely",
        B: "capable",
        C: "certain",
        D: "suitable",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She was very ____ of her brother's success in the competition.",
      options: {
        A: "proud",
        B: "aware",
        C: "capable",
        D: "fond",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "We need to ____ our goals before we start the project.",
      options: {
        A: "identify",
        B: "predict",
        C: "explain",
        D: "pretend",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Despite the rain, they ____ to enjoy their camping trip.",
      options: {
        A: "succeeded",
        B: "managed",
        C: "tried",
        D: "expected",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The teacher told the students to ____ the instructions carefully before beginning.",
      options: {
        A: "read through",
        B: "look after",
        C: "carry out",
        D: "bring up",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She found it hard to ____ the difference between the two products.",
      options: {
        A: "tell",
        B: "say",
        C: "speak",
        D: "talk",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "It is ____ to drive without wearing a seatbelt.",
      options: {
        A: "dangerous",
        B: "cautious",
        C: "confident",
        D: "serious",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The restaurant is famous for its ____ selection of desserts.",
      options: {
        A: "various",
        B: "wide",
        C: "common",
        D: "large",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Please ____ the lights when you leave the office.",
      options: {
        A: "turn off",
        B: "turn down",
        C: "turn over",
        D: "turn out",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "His performance was ____; everyone in the audience cheered for him.",
      options: {
        A: "outstanding",
        B: "boring",
        C: "average",
        D: "terrible",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "I can't ____ why he made such a strange decision.",
      options: {
        A: "figure out",
        B: "go over",
        C: "take on",
        D: "get across",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Learning a new language can be a ____ experience.",
      options: {
        A: "rewarding",
        B: "grateful",
        C: "pleasant",
        D: "suitable",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The manager decided to ____ the meeting until next week.",
      options: {
        A: "postpone",
        B: "cancel",
        C: "discuss",
        D: "attend",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She is very ____; she always finishes her work on time.",
      options: {
        A: "reliable",
        B: "cautious",
        C: "dull",
        D: "forgetful",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "We need to find a solution to this ____ problem as soon as possible.",
      options: {
        A: "complex",
        B: "simple",
        C: "easy",
        D: "clear",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He ____ his father, both in appearance and personality.",
      options: {
        A: "takes after",
        B: "looks for",
        C: "calls off",
        D: "puts off",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The city has a very ____ public transport system.",
      options: {
        A: "efficient",
        B: "expensive",
        C: "frequent",
        D: "natural",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She didn't ____ that her boss was standing right behind her.",
      options: {
        A: "notice",
        B: "recognize",
        C: "watch",
        D: "stare",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The charity works to ____ the lives of poor children in the region.",
      options: {
        A: "improve",
        B: "increase",
        C: "provide",
        D: "damage",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He was ____ when he heard he had won the scholarship.",
      options: {
        A: "delighted",
        B: "disappointed",
        C: "nervous",
        D: "bored",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "I’m sorry, I didn’t ____ to interrupt your conversation.",
      options: {
        A: "mean",
        B: "intend",
        C: "think",
        D: "want",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The film was so ____ that I fell asleep halfway through.",
      options: {
        A: "dull",
        B: "exciting",
        C: "brilliant",
        D: "moving",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "It’s important to ____ a healthy balance between work and life.",
      options: {
        A: "maintain",
        B: "increase",
        C: "destroy",
        D: "reduce",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She decided to ____ for the job despite having little experience.",
      options: {
        A: "apply",
        B: "ask",
        C: "inquire",
        D: "request",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The museum offers ____ entry for children under twelve.",
      options: {
        A: "free",
        B: "empty",
        C: "open",
        D: "clear",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "We should ____ this opportunity to learn something new.",
      options: {
        A: "take",
        B: "make",
        C: "do",
        D: "get",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He was ____ about the results of his medical tests.",
      options: {
        A: "anxious",
        B: "comfortable",
        C: "brave",
        D: "proud",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Can you ____ a good restaurant for dinner tonight?",
      options: {
        A: "recommend",
        B: "suggest",
        C: "propose",
        D: "advise",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The ____ from the apartment were absolutely stunning.",
      options: {
        A: "views",
        B: "sights",
        C: "looks",
        D: "images",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She tried to ____ him of the benefits of joining the club.",
      options: {
        A: "convince",
        B: "force",
        C: "command",
        D: "suggest",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The room was so ____ that there wasn't enough space for everyone.",
      options: {
        A: "cramped",
        B: "spacious",
        C: "bright",
        D: "modern",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Please ____ me updated on any changes to the schedule.",
      options: {
        A: "keep",
        B: "stay",
        C: "hold",
        D: "remain",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He felt ____ for forgetting his friend's birthday.",
      options: {
        A: "guilty",
        B: "proud",
        C: "innocent",
        D: "surprised",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The ____ result of the project was better than we expected.",
      options: {
        A: "final",
        B: "last",
        C: "end",
        D: "concluding",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "You should ____ a complaint if you are unhappy with the service.",
      options: {
        A: "make",
        B: "do",
        C: "say",
        D: "give",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The book is ____ for readers of all ages.",
      options: {
        A: "suitable",
        B: "capable",
        C: "possible",
        D: "able",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Despite the long delay, the passengers remained ____.",
      options: {
        A: "patient",
        B: "anxious",
        C: "frustrated",
        D: "angry",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The new policy will ____ effect next month.",
      options: {
        A: "come into",
        B: "go in",
        C: "take in",
        D: "put on",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She has a very ____ personality and makes friends easily.",
      options: {
        A: "outgoing",
        B: "reserved",
        C: "distant",
        D: "quiet",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "It's ____ that you bring an umbrella; it's going to rain.",
      options: {
        A: "advisable",
        B: "possible",
        C: "capable",
        D: "suitable",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The manager decided to ____ the meeting until next week because many people were ill.",
      options: {
        A: "postpone",
        B: "cancel",
        C: "delay",
        D: "interrupt",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "It is ____ to check your passport before leaving for the airport.",
      options: {
        A: "essential",
        B: "optional",
        C: "frequent",
        D: "various",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She felt ____ after winning the first prize in the national competition.",
      options: {
        A: "delighted",
        B: "bored",
        C: "anxious",
        D: "confused",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The new employee is very ____; he always arrives exactly on time.",
      options: {
        A: "punctual",
        B: "reliable",
        C: "ambitious",
        D: "cautious",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "I don't think that film is suitable ____ young children due to the violence.",
      options: {
        A: "for",
        B: "to",
        C: "with",
        D: "at",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The city council plans to ____ the old library and build a modern shopping center.",
      options: {
        A: "demolish",
        B: "construct",
        C: "maintain",
        D: "restore",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "Despite working hard, he didn't ____ in finishing the report on time.",
      options: {
        A: "succeed",
        B: "manage",
        C: "achieve",
        D: "win",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Could you please ____ your opinion on the new office policy?",
      options: {
        A: "share",
        B: "suggest",
        C: "demand",
        D: "inform",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The loud music from the party next door was a real ____ when I was trying to sleep.",
      options: {
        A: "nuisance",
        B: "benefit",
        C: "pleasure",
        D: "comfort",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The shop assistant was very ____ and helped me find exactly what I needed.",
      options: {
        A: "helpful",
        B: "harmful",
        C: "careless",
        D: "dull",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "If you want to stay healthy, you should ____ eating processed food.",
      options: {
        A: "avoid",
        B: "enjoy",
        C: "include",
        D: "repeat",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She is very ____ of her brother's success in his new career.",
      options: {
        A: "proud",
        B: "aware",
        C: "capable",
        D: "fond",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "I need to ____ my bank account to see if my salary has arrived.",
      options: {
        A: "check",
        B: "glance",
        C: "stare",
        D: "observe",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The instructions were so ____ that nobody knew how to assemble the furniture.",
      options: {
        A: "confusing",
        B: "helpful",
        C: "logical",
        D: "brief",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The company is looking for someone who is ____ in both English and French.",
      options: {
        A: "fluent",
        B: "active",
        C: "familiar",
        D: "certain",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He has a great ____ of humor and always makes everyone laugh.",
      options: {
        A: "sense",
        B: "feeling",
        C: "mood",
        D: "thought",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The hotel was ____ situated right next to the beach.",
      options: {
        A: "ideally",
        B: "physically",
        C: "basically",
        D: "naturally",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "I'm sorry, I didn't mean to ____ your conversation.",
      options: {
        A: "interrupt",
        B: "prevent",
        C: "avoid",
        D: "refuse",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The report provides a detailed ____ of the current economic situation.",
      options: {
        A: "overview",
        B: "lookout",
        C: "preview",
        D: "hindsight",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She finally decided to ____ for the job after thinking about it for weeks.",
      options: {
        A: "apply",
        B: "request",
        C: "inquire",
        D: "demand",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The lecture was quite ____, but I learned a lot of new things.",
      options: {
        A: "demanding",
        B: "forgiving",
        C: "reliable",
        D: "patient",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "We had to ____ our travel plans because of the bad weather.",
      options: {
        A: "alter",
        B: "insist",
        C: "persuade",
        D: "provide",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "It is ____ that we arrive early to get the best seats.",
      options: {
        A: "advisable",
        B: "capable",
        C: "possible",
        D: "suitable",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "He was very ____ when his friend offered to help him with the project.",
      options: {
        A: "grateful",
        B: "guilty",
        C: "stubborn",
        D: "anxious",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The museum entrance is ____ every day except Monday.",
      options: {
        A: "accessible",
        B: "avoidable",
        C: "capable",
        D: "reliable",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Don't ____ the truth, just tell me exactly what happened.",
      options: {
        A: "hide",
        B: "lose",
        C: "miss",
        D: "waste",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She has an ____ ability to solve math problems quickly.",
      options: {
        A: "amazing",
        B: "unlikely",
        C: "amusing",
        D: "annoying",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The two brothers are very different in ____.",
      options: {
        A: "character",
        B: "nature",
        C: "behavior",
        D: "reputation",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "You should take the ____ to read the instructions before you start.",
      options: {
        A: "time",
        B: "chance",
        C: "opportunity",
        D: "moment",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The teacher ____ the students to finish their work by noon.",
      options: {
        A: "expected",
        B: "supposed",
        C: "intended",
        D: "hoped",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He is very ____ about the future of his new business.",
      options: {
        A: "optimistic",
        B: "pessimistic",
        C: "serious",
        D: "curious",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "They were able to ____ their differences and start working together.",
      options: {
        A: "overcome",
        B: "overtake",
        C: "overlook",
        D: "overthrow",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The doctor gave me a ____ for some medicine to help with my cough.",
      options: {
        A: "prescription",
        B: "receipt",
        C: "description",
        D: "register",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "She had to ____ the offer because it didn't fit her career goals.",
      options: {
        A: "decline",
        B: "accept",
        C: "approve",
        D: "admit",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The mountain view was absolutely ____ at sunrise.",
      options: {
        A: "breathtaking",
        B: "heartbreaking",
        C: "earsplitting",
        D: "timesaving",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "It is important to ____ waste to protect the environment.",
      options: {
        A: "reduce",
        B: "increase",
        C: "promote",
        D: "maintain",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The project was a big ____ for the company this year.",
      options: {
        A: "success",
        B: "failure",
        C: "effort",
        D: "choice",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He has a great ____ to learn as much as he can.",
      options: {
        A: "desire",
        B: "demand",
        C: "requirement",
        D: "command",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She didn't ____ that her mistake would cause so much trouble.",
      options: {
        A: "realize",
        B: "recognize",
        C: "notice",
        D: "perceive",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The government is trying to ____ the economy.",
      options: {
        A: "strengthen",
        B: "weakening",
        C: "threaten",
        D: "brighten",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "I'm sorry, I didn't ____ to cause any confusion.",
      options: {
        A: "intend",
        B: "suggest",
        C: "pretend",
        D: "decide",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "She works very ____ and never complains about her tasks.",
      options: {
        A: "efficiently",
        B: "carelessly",
        C: "slowly",
        D: "rarely",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The team needs to ____ a new strategy for the next game.",
      options: {
        A: "develop",
        B: "discover",
        C: "deliver",
        D: "determine",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "Can you ____ a good book for my flight?",
      options: {
        A: "recommend",
        B: "advise",
        C: "propose",
        D: "demand",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The atmosphere in the room was quite ____ before the exam started.",
      options: {
        A: "tense",
        B: "relaxed",
        C: "calm",
        D: "cheerful",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "He needs to ____ his bad habits if he wants to get fit.",
      options: {
        A: "give up",
        B: "take up",
        C: "look up",
        D: "make up",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The concert was ____, with thousands of people attending.",
      options: {
        A: "crowded",
        B: "spacious",
        C: "empty",
        D: "quiet",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "It's ____ to park your car in the middle of the road.",
      options: {
        A: "illegal",
        B: "logical",
        C: "possible",
        D: "helpful",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question:
        "The teacher gave the students some ____ on how to improve their essays.",
      options: {
        A: "advice",
        B: "suggestion",
        C: "proposal",
        D: "information",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "B1",
      question: "The film’s ending was quite ____, I didn't expect it at all.",
      options: {
        A: "surprising",
        B: "boring",
        C: "predictable",
        D: "usual",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The CEO's ____ remarks during the press conference managed to appease the angry shareholders without revealing sensitive trade secrets.",
      options: {
        A: "ambiguous",
        B: "vehement",
        C: "conciliatory",
        D: "derogatory",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Despite the evidence presented, the defendant remained ____, insisting that he had no knowledge of the illicit activities.",
      options: {
        A: "adamant",
        B: "pliable",
        C: "gregarious",
        D: "negligent",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The candidate's ____ background in international law made her an ideal choice for the position at the United Nations.",
      options: {
        A: "superficial",
        B: "extensive",
        C: "fickle",
        D: "tenuous",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Environmentalists argue that the current rate of deforestation is ____ and will lead to an irreversible loss of biodiversity.",
      options: {
        A: "sustainable",
        B: "negligible",
        C: "untenable",
        D: "feasible",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ style of management often frustrated his subordinates, who felt they were never given enough autonomy.",
      options: {
        A: "autocratic",
        B: "lenient",
        C: "inclusive",
        D: "collaborative",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The government launched a ____ investigation into the banking scandal to restore public confidence in the financial system.",
      options: {
        A: "cursory",
        B: "thorough",
        C: "trivial",
        D: "haphazard",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The report provides a ____ account of the events leading up to the merger, detailing every minor negotiation.",
      options: {
        A: "vague",
        B: "comprehensive",
        C: "misleading",
        D: "sketchy",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Her ____ personality ensures that she is always the center of attention at social gatherings.",
      options: {
        A: "solitary",
        B: "diffident",
        C: "gregarious",
        D: "melancholy",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The architect's design was ____, blending modern minimalist aesthetics with traditional local materials.",
      options: {
        A: "innovative",
        B: "obsolete",
        C: "redundant",
        D: "commonplace",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The professor’s lecture was so ____ that many students struggled to grasp the core concepts.",
      options: {
        A: "lucid",
        B: "esoteric",
        C: "coherent",
        D: "articulate",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The company’s decision to cut staff was met with ____ opposition from the labor union.",
      options: {
        A: "faint",
        B: "tepid",
        C: "vehement",
        D: "passive",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "It is ____ to assume that technology will solve all of society’s problems without human intervention.",
      options: {
        A: "pragmatic",
        B: "naive",
        C: "astute",
        D: "perceptive",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Despite the ____ differences in their political views, the two rivals managed to work together for the sake of the project.",
      options: {
        A: "striking",
        B: "trivial",
        C: "negligible",
        D: "minimal",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The witness provided a ____ explanation that left the jury questioning her reliability.",
      options: {
        A: "plausible",
        B: "tenuous",
        C: "credible",
        D: "straightforward",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The author’s latest novel is a ____ of social norms, highlighting the absurdity of modern life.",
      options: {
        A: "synthesis",
        B: "critique",
        C: "endorsement",
        D: "promotion",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The museum curator was ____ in her selection of artifacts, ensuring that only the most significant pieces were displayed.",
      options: {
        A: "indiscriminate",
        B: "meticulous",
        C: "negligent",
        D: "hasty",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The negotiations were ____, ending in a stalemate after hours of intense debate.",
      options: {
        A: "productive",
        B: "fruitless",
        C: "efficacious",
        D: "constructive",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "He was ____ from the company after he was caught leaking confidential information to competitors.",
      options: {
        A: "dismissed",
        B: "promoted",
        C: "recruited",
        D: "appointed",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The politician’s speech was a ____ attempt to distance himself from the recent corruption scandal.",
      options: {
        A: "candid",
        B: "transparent",
        C: "calculated",
        D: "spontaneous",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The sheer ____ of the project made it difficult for the team to meet the tight deadline.",
      options: {
        A: "simplicity",
        B: "complexity",
        C: "brevity",
        D: "ease",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Her ____ work in the field of artificial intelligence earned her international recognition.",
      options: {
        A: "pioneering",
        B: "derivative",
        C: "obsolete",
        D: "mediocre",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The new policy is expected to ____ efficiency in the workplace by reducing unnecessary bureaucratic steps.",
      options: {
        A: "hinder",
        B: "bolster",
        C: "impede",
        D: "obstruct",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ regarding the future of the economy proved to be accurate in light of recent events.",
      options: {
        A: "forecasting",
        B: "hindsight",
        C: "insignificance",
        D: "retrospection",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The jury found the evidence ____, as it did not directly link the defendant to the crime scene.",
      options: {
        A: "conclusive",
        B: "circumstantial",
        C: "irrefutable",
        D: "compelling",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The organization works to ____ the suffering of families affected by natural disasters.",
      options: {
        A: "exacerbate",
        B: "alleviate",
        C: "aggravate",
        D: "intensify",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "There is a ____ risk that the market will become oversaturated if too many competitors enter at once.",
      options: {
        A: "substantial",
        B: "negligible",
        C: "minuscule",
        D: "frivolous",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The artist sought to ____ the beauty of the landscape through his intricate use of color and light.",
      options: {
        A: "obscure",
        B: "capture",
        C: "distort",
        D: "conceal",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The proposal was ____ because it failed to address the core budgetary constraints mentioned in the brief.",
      options: {
        A: "viable",
        B: "impractical",
        C: "attainable",
        D: "expedient",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "In a ____ display of bravery, the firefighter rushed into the burning building to save the trapped occupants.",
      options: {
        A: "timid",
        B: "daring",
        C: "cowardly",
        D: "cautious",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The professor is known for his ____ approach, often drawing on philosophy, sociology, and economics to explain his theories.",
      options: {
        A: "narrow",
        B: "interdisciplinary",
        C: "pedantic",
        D: "sectarian",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The company’s growth has been ____, expanding into three new countries within just two years.",
      options: {
        A: "stagnant",
        B: "rapid",
        C: "negligible",
        D: "gradual",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The diplomat worked tirelessly to ____ the tension between the two neighboring nations.",
      options: {
        A: "escalate",
        B: "mitigate",
        C: "heighten",
        D: "inflame",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ sense of humor often caught people off guard, as he made jokes at the most unexpected times.",
      options: {
        A: "droll",
        B: "solemn",
        C: "melancholy",
        D: "grave",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The board of directors issued a ____ statement denying any involvement in the unethical practices.",
      options: {
        A: "vague",
        B: "categorical",
        C: "indistinct",
        D: "ambiguous",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Many economists believe that the current tax system is ____ and needs significant reform.",
      options: {
        A: "archaic",
        B: "contemporary",
        C: "innovative",
        D: "modern",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "She is ____ of the potential risks associated with the investment, yet she remains optimistic about the long-term gains.",
      options: {
        A: "oblivious",
        B: "cognizant",
        C: "ignorant",
        D: "naive",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The debate was ____ by the lack of clear definitions regarding the key terminology used.",
      options: {
        A: "facilitated",
        B: "impeded",
        C: "expedited",
        D: "promoted",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ knowledge of classical music made him a favorite guest on the radio program.",
      options: {
        A: "encyclopedic",
        B: "scant",
        C: "rudimentary",
        D: "superficial",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The team needs to ____ a strategy that will allow them to outmaneuver their rivals in the market.",
      options: {
        A: "devise",
        B: "dismantle",
        C: "abandon",
        D: "neglect",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The ____ result of the long research process was a groundbreaking discovery in vaccine development.",
      options: {
        A: "fleeting",
        B: "culminating",
        C: "initial",
        D: "preliminary",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The committee reached a ____ decision, with all members in complete agreement.",
      options: {
        A: "unanimous",
        B: "divided",
        C: "controversial",
        D: "contentious",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The new regulations were ____ in order to improve safety standards across the industry.",
      options: {
        A: "implemented",
        B: "abolished",
        C: "retracted",
        D: "repealed",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ personality made it difficult for him to form long-lasting professional relationships.",
      options: {
        A: "affable",
        B: "abrasive",
        C: "amiable",
        D: "cordial",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The company’s ____ performance in the third quarter exceeded all analyst expectations.",
      options: {
        A: "dismal",
        B: "robust",
        C: "lackluster",
        D: "meager",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The lecturer’s tone was ____, expressing deep sadness regarding the state of the environment.",
      options: {
        A: "exuberant",
        B: "somber",
        C: "cheerful",
        D: "jovial",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The politician’s ____ were widely criticized as being out of touch with the struggles of the working class.",
      options: {
        A: "sentiments",
        B: "endorsements",
        C: "contributions",
        D: "realizations",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The study aims to ____ the relationship between sleep quality and academic performance.",
      options: {
        A: "elucidate",
        B: "obscure",
        C: "confuse",
        D: "complicate",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "She took a ____ approach to the project, planning for every possible outcome well in advance.",
      options: {
        A: "systematic",
        B: "haphazard",
        C: "random",
        D: "chaotic",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The senator’s ____ speech received a standing ovation from the crowd.",
      options: {
        A: "eloquent",
        B: "inarticulate",
        C: "incoherent",
        D: "mumbled",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The company was ____ in its efforts to reduce waste, setting ambitious targets for the coming year.",
      options: {
        A: "indifferent",
        B: "diligent",
        C: "negligent",
        D: "apathetic",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The CEO's sudden resignation was ____ with rumors of a long-standing dispute among the board members.",
      options: {
        A: "inexplicable",
        B: "fraught",
        C: "tangled",
        D: "rife",
      },
      answer: "D",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The senator’s ____ attempt to win over the younger voters failed because his policies lacked substantive detail.",
      options: {
        A: "garrulous",
        B: "superficial",
        C: "audacious",
        D: "mitigated",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Her colleagues admired her ____ ability to remain calm under extreme pressure during the project's final phase.",
      options: {
        A: "innate",
        B: "obscure",
        C: "feigned",
        D: "stagnant",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The architect's vision for the new museum was so ____ that the committee struggled to understand the practical implications.",
      options: {
        A: "pragmatic",
        B: "abstract",
        C: "coherent",
        D: "lucid",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Despite the harsh criticism, the author remained ____ in his belief that the artistic medium required change.",
      options: {
        A: "vacillating",
        B: "adamant",
        C: "tractable",
        D: "pliant",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The new law was ____ to address the growing disparity in wealth between urban and rural populations.",
      options: {
        A: "designed",
        B: "intended",
        C: "conceived",
        D: "implemented",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The candidate gave a ____ summary of her previous experience, skipping over the failed startups entirely.",
      options: {
        A: "cursory",
        B: "comprehensive",
        C: "thorough",
        D: "minute",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The negotiations reached an ____ when both sides refused to compromise on the core demands.",
      options: {
        A: "inception",
        B: "impasse",
        C: "inception",
        D: "incentive",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Environmentalists are calling for ____ action to prevent the irreversible loss of endangered species.",
      options: {
        A: "decisive",
        B: "indecisive",
        C: "erratic",
        D: "superficial",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The team’s failure to deliver the project on time was a ____ of poor planning and limited resources.",
      options: {
        A: "consequence",
        B: "proclivity",
        C: "manifestation",
        D: "pretext",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The witness provided a ____ account that contradicted the official police report.",
      options: {
        A: "divergent",
        B: "convergent",
        C: "harmonious",
        D: "consistent",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The scientist was praised for his ____ approach to solving the complex mathematical problem.",
      options: {
        A: "haphazard",
        B: "systematic",
        C: "negligent",
        D: "flawed",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The new regulations were ____ in order to streamline the bureaucratic process for small businesses.",
      options: {
        A: "abolished",
        B: "amended",
        C: "exacerbated",
        D: "abandoned",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ sense of humor often kept the mood light, even during the most stressful meetings.",
      options: {
        A: "droll",
        B: "morose",
        C: "austere",
        D: "somber",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The company’s decision to diversify its portfolio proved to be a ____ move in a volatile market.",
      options: {
        A: "myopic",
        B: "shrewd",
        C: "frivolous",
        D: "rash",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The professor’s lecture was so ____ that it sparked a lively discussion among the post-graduate students.",
      options: {
        A: "tedious",
        B: "provocative",
        C: "monotonous",
        D: "insipid",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "They were able to ____ the truth from the vague statements provided by the consultant.",
      options: {
        A: "elicit",
        B: "elucidate",
        C: "exacerbate",
        D: "obscure",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The organization works to ____ the gap between academic theory and real-world application.",
      options: {
        A: "bridge",
        B: "widen",
        C: "dismantle",
        D: "sever",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His apology was seen as ____, as he showed no signs of genuine remorse for his actions.",
      options: {
        A: "sincere",
        B: "candid",
        C: "superficial",
        D: "authentic",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The government was forced to ____ its earlier statements regarding the economic recovery.",
      options: {
        A: "retract",
        B: "uphold",
        C: "endorse",
        D: "proclaim",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The city council’s proposal was met with ____ resistance from local residents.",
      options: {
        A: "tepid",
        B: "vehement",
        C: "meager",
        D: "negligible",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The artist is known for his ____ style, which refuses to conform to current mainstream trends.",
      options: {
        A: "idiosyncratic",
        B: "conventional",
        C: "derivative",
        D: "commonplace",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The report provides a ____ account of the financial mismanagement, leaving no detail unexamined.",
      options: {
        A: "scathing",
        B: "haphazard",
        C: "ambiguous",
        D: "vague",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The manager attempted to ____ the conflict by encouraging an open dialogue between the opposing departments.",
      options: {
        A: "escalate",
        B: "resolve",
        C: "exacerbate",
        D: "compound",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The change in strategy was ____ by the sudden drop in quarterly revenue.",
      options: {
        A: "prompted",
        B: "deterred",
        C: "hindered",
        D: "inhibited",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The judge was known for his ____ rulings, which were always based on clear legal precedents.",
      options: {
        A: "arbitrary",
        B: "impartial",
        C: "erratic",
        D: "biased",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The team had to ____ their plans when they realized the project budget had been significantly slashed.",
      options: {
        A: "curtail",
        B: "bolster",
        C: "amplify",
        D: "enhance",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The consultant’s advice was ____ in helping the company navigate the complex merger.",
      options: {
        A: "instrumental",
        B: "detrimental",
        C: "negligible",
        D: "superfluous",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The lecture was ____ with anecdotes that helped clarify the abstract theories.",
      options: {
        A: "fraught",
        B: "interspersed",
        C: "void",
        D: "devoid",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The scientist argued that the evidence was ____ and could not be ignored any longer.",
      options: {
        A: "irrefutable",
        B: "dubious",
        C: "tenuous",
        D: "ambiguous",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The transition to remote work was ____, with some departments struggling more than others.",
      options: {
        A: "seamless",
        B: "uneven",
        C: "unanimous",
        D: "uniform",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The proposal was ____ in its intent but ultimately failed to secure enough funding.",
      options: {
        A: "laudable",
        B: "negligent",
        C: "despicable",
        D: "erroneous",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "He ____ that the sudden dip in sales was merely a temporary fluctuation in the market.",
      options: {
        A: "contended",
        B: "relinquished",
        C: "retracted",
        D: "yielded",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The new manager has a ____ style of leadership, always delegating tasks to those best suited for them.",
      options: {
        A: "collaborative",
        B: "autocratic",
        C: "dictatorial",
        D: "myopic",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The complexity of the tax code is often a source of ____ for small business owners.",
      options: {
        A: "exasperation",
        B: "elation",
        C: "exhilaration",
        D: "satisfaction",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The data analysis was ____ by the fact that some of the records were incomplete.",
      options: {
        A: "hampered",
        B: "expedited",
        C: "facilitated",
        D: "advanced",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The team felt ____ after working for sixteen hours straight without a break.",
      options: {
        A: "invigorated",
        B: "depleted",
        C: "replenished",
        D: "stimulated",
      },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The politician's speech was ____, avoiding any direct answers to the tough questions from the press.",
      options: {
        A: "evasive",
        B: "transparent",
        C: "candid",
        D: "explicit",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Her career has been marked by a ____ commitment to social justice and civil rights.",
      options: {
        A: "steadfast",
        B: "vacillating",
        C: "fickle",
        D: "negligent",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The software is designed to ____ the process of generating monthly financial reports.",
      options: {
        A: "automate",
        B: "hinder",
        C: "complicate",
        D: "obstruct",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The museum's collection is ____, spanning centuries of history and diverse cultural traditions.",
      options: {
        A: "eclectic",
        B: "uniform",
        C: "meager",
        D: "homogenous",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The team needs to ____ the risks before committing to such a large investment.",
      options: {
        A: "assess",
        B: "ignore",
        C: "overlook",
        D: "disregard",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "Despite the team's effort, the final product was ____ of the original vision.",
      options: {
        A: "reminiscent",
        B: "devoid",
        C: "void",
        D: "lackluster",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The research was ____, covering every possible aspect of the topic.",
      options: {
        A: "exhaustive",
        B: "cursory",
        C: "skimpy",
        D: "fragmentary",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "His ____ response to the criticism was to ignore it completely.",
      options: {
        A: "initial",
        B: "instinctive",
        C: "deliberate",
        D: "spontaneous",
      },
      answer: "C",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The company’s growth has been ____, showing no signs of slowing down anytime soon.",
      options: {
        A: "relentless",
        B: "stagnant",
        C: "fleeting",
        D: "negligible",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The new policy was ____ as it caused more problems than it solved.",
      options: {
        A: "counterproductive",
        B: "efficacious",
        C: "beneficial",
        D: "constructive",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question: "He was ____ by the sudden change in company management.",
      options: {
        A: "unsettled",
        B: "reassured",
        C: "composed",
        D: "encouraged",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question:
        "The professor is known for his ____ ability to explain complex theories in simple terms.",
      options: {
        A: "singular",
        B: "negligible",
        C: "vague",
        D: "fickle",
      },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "C1",
      question: "The project is currently in the ____ stages of development.",
      options: {
        A: "nascent",
        B: "finalized",
        C: "concluded",
        D: "terminated",
      },
      answer: "A",
      skill: "vocabulary",
    },
  ];

  let count = 0;
  for (const q of questionSeeds) {
    const exists = await prisma.vocabularyQuestion.findFirst({
      where: { question: q.question, level: q.level },
    });
    if (!exists) {
      await prisma.vocabularyQuestion.create({ data: q });
      count++;
    }
  }

  console.log(`✅ ${count} A1 questions seeded`);
  return count;
}

module.exports = { seedVocabularyQuestions };
