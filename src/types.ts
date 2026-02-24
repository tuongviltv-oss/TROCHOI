export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  reward: string;
  rewardIcon: string;
}

export interface GameState {
  status: 'START' | 'PLAYING' | 'END';
  currentQuestionIndex: number;
  score: number;
  collectedItems: string[];
  userInfo: {
    name: string;
    className: string;
  };
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Một túi bánh giá 18 000 đồng và một chai sữa giá 12 000 đồng. Hỏi phải trả tất cả bao nhiêu tiền?",
    options: ["28 000", "29 000", "30 000", "31 000"],
    correctAnswer: "30 000",
    hint: "Hãy cộng 18 000 và 12 000.",
    reward: "Xe điều khiển từ xa siêu tốc",
    rewardIcon: "🚗"
  },
  {
    id: 2,
    text: "Một quyển truyện giá 32 000 đồng. Bé đưa 50 000 đồng. Hỏi được trả lại bao nhiêu tiền?",
    options: ["16 000", "17 000", "18 000", "19 000"],
    correctAnswer: "18 000",
    hint: "Lấy 50 000 trừ 32 000.",
    reward: "Máy chơi game mini",
    rewardIcon: "🎮"
  },
  {
    id: 3,
    text: "Lan có 60 000 đồng. Lan mua hộp sữa 22 000 đồng và túi bánh 15 000 đồng. Hỏi còn lại bao nhiêu tiền?",
    options: ["21 000", "22 000", "23 000", "24 000"],
    correctAnswer: "23 000",
    hint: "Bước 1: Lấy 22 000 + 15 000. Bước 2: Lấy 60 000 - số tiền vừa tìm được.",
    reward: "Gấu bông khổng lồ phát nhạc",
    rewardIcon: "🧸"
  },
  {
    id: 4,
    text: "Nam có 80 000 đồng. Nam mua cặp 45 000 đồng và bút màu 18 000 đồng. Hỏi còn lại bao nhiêu tiền?",
    options: ["15 000", "16 000", "17 000", "18 000"],
    correctAnswer: "17 000",
    hint: "Bước 1: 45 000 + 18 000. Bước 2: 80 000 - số tiền vừa tìm được.",
    reward: "Xe scooter phát sáng",
    rewardIcon: "🛴"
  },
  {
    id: 5,
    text: "Mai có 70 000 đồng. Mai mua váy 42 000 đồng và một chiếc nón. Sau khi mua xong còn lại 8 000 đồng. Hỏi chiếc nón giá bao nhiêu tiền?",
    options: ["18 000", "19 000", "20 000", "21 000"],
    correctAnswer: "20 000",
    hint: "Bước 1: 70 000 - 8 000. Bước 2: Lấy số tiền đó - 42 000.",
    reward: "Hộp quà bí mật phát sáng",
    rewardIcon: "🎉"
  }
];
