async function seedVocabularyQuestions(prisma) {
  const questionSeeds = [
    // Numbers (1-10)
    {
      level: "A1",
      question: "How do you say 'satu' in English?",
      options: { A: "One", B: "Two", C: "Three", D: "Four" },
      answer: "A",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "Which is the number five?",
      options: { A: "3", B: "5", C: "7", D: "9" },
      answer: "B",
      skill: "vocabulary",
    },
    {
      level: "A1",
      question: "How many is 'sepuluh' in English?",
      options: { A: "7", B: "8", C: "9", D: "10" },
      answer: "D",
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
    {
      level: "A1",
      question: "What do you call a young dog?",
      options: { A: "Puppy", B: "Kitten", C: "Foal", D: "Calf" },
      answer: "A",
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
