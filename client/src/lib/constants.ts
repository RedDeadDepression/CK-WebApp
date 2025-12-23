export const PRACTICES_DB = [
  { "id": 301, "title": "Ice Cube Shock", "text": "Hold an ice cube in your hand until it melts completely. Focus on the sensation.", "type": "SENSE", "tags": { "loc": "HOME", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 302, "title": "4-7-8 Breathing", "text": "Inhale for 4 sec. Hold for 7 sec. Exhale for 8 sec. Repeat 4 times.", "type": "BREATH", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 303, "title": "Eat a Lemon", "text": "Bite into a slice of lemon. The sharp sour taste resets your brain chemistry.", "type": "SENSE", "tags": { "loc": "HOME", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 304, "title": "15 Squats", "text": "Drop down and do 15 squats right now. Get your heart rate up!", "type": "BODY", "tags": { "loc": "ANY", "soc": "PRIVATE", "state": "SOBER" } },
  { "id": 305, "title": "Find 5 Red Objects", "text": "Look around and name 5 red objects you can see. Say them out loud.", "type": "BRAIN", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 306, "title": "Cold Face Wash", "text": "Splash your face with freezing cold water 3 times.", "type": "SENSE", "tags": { "loc": "HOME", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 307, "title": "Write Your Why", "text": "Open notes on your phone. Write down ONE reason why you want to live.", "type": "BRAIN", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "SOBER" } },
  { "id": 310, "title": "Fist Clench", "text": "Clench your fists as hard as you can for 5 seconds, then release. Repeat 5 times.", "type": "BODY", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 313, "title": "Change Location", "text": "Stand up and walk to a different room or step outside. Physically move your body.", "type": "BODY", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 314, "title": "Loud Music", "text": "Put on headphones. Play your favorite energetic song at max volume.", "type": "SENSE", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 315, "title": "Stairs Run", "text": "Find stairs. Run up and down for 1 minute.", "type": "BODY", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "SOBER" } },
  { "id": 320, "title": "Phone Game", "text": "Play Tetris or Candy Crush for exactly 3 minutes.", "type": "BRAIN", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 321, "title": "Pillow Scream", "text": "Grab a pillow. Scream into it as loud as you can.", "type": "BODY", "tags": { "loc": "HOME", "soc": "PRIVATE", "state": "ANY" } },
  { "id": 324, "title": "Smell Something Strong", "text": "Smell coffee beans, perfume, or essential oils deeply.", "type": "SENSE", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "SOBER" } },
  { "id": 325, "title": "Count Backwards", "text": "Count backwards from 100 by 7s (100, 93, 86...)", "type": "BRAIN", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "SOBER" } },
  { "id": 327, "title": "Plank Challenge", "text": "Hold a plank position for 1 minute. Let the burn distract you.", "type": "BODY", "tags": { "loc": "ANY", "soc": "PRIVATE", "state": "SOBER" } },
  { "id": 339, "title": "Visualization", "text": "Close eyes. Visualize a giant stop sign. Then visualize a calm ocean.", "type": "BREATH", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 361, "title": "Ear Massage", "text": "Massage the upper part of your ear (Shen Men point) firmly.", "type": "BODY", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } },
  { "id": 362, "title": "Alphabet Game", "text": "Name an animal for every letter: A-Ant, B-Bear, C-Cat...", "type": "BRAIN", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "SOBER" } },
  { "id": 383, "title": "10 Minute Rule", "text": "Tell yourself: 'I will smoke in 10 minutes if I still want to'. Wait.", "type": "BRAIN", "tags": { "loc": "ANY", "soc": "PUBLIC", "state": "ANY" } }
] as const;

export type Practice = typeof PRACTICES_DB[number];
