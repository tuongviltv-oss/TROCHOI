/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  Volume2, 
  VolumeX, 
  Timer as TimerIcon, 
  Trophy, 
  Star, 
  ArrowRight, 
  RotateCcw,
  ShoppingBag,
  User,
  School
} from 'lucide-react';
import { QUESTIONS, GameState, Question } from './types.ts';
import { audioManager } from './services/audioService.ts';

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden border-2 border-white">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      className="bg-super-green h-full"
    />
  </div>
);

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            top: '110%',
            rotate: 360,
            left: `${Math.random() * 100}%`
          }}
          transition={{ 
            duration: Math.random() * 2 + 2, 
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2
          }}
          className="absolute text-2xl"
        >
          {['🌸', '✨', '🎊', '🎈', '⭐'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    currentQuestionIndex: 0,
    score: 0,
    collectedItems: [],
    userInfo: { name: '', className: '' }
  });

  const [timeLeft, setTimeLeft] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [flyingItem, setFlyingItem] = useState<string | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = QUESTIONS[gameState.currentQuestionIndex];

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleWrongAnswer();
          return 0;
        }
        if (prev === 4) audioManager.play('tick');
        return prev - 1;
      });
    }, 1000);
  }, [gameState.currentQuestionIndex]);

  useEffect(() => {
    if (gameState.status === 'PLAYING') {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status, gameState.currentQuestionIndex, startTimer]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState.userInfo.name && gameState.userInfo.className) {
      setGameState(prev => ({ ...prev, status: 'PLAYING' }));
      audioManager.startBgMusic();
    }
  };

  const handleWrongAnswer = () => {
    audioManager.play('wrong');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    
    if (attempts === 0) {
      setShowHint(true);
      setAttempts(1);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    } else {
      nextQuestion();
    }
  };

  const handleCorrectAnswer = () => {
    const points = attempts === 0 ? 10 : 5;
    audioManager.play('correct');
    audioManager.play('applause');
    setFeedback('correct');
    setFlyingItem(currentQuestion.rewardIcon);
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      collectedItems: [...prev.collectedItems, currentQuestion.rewardIcon]
    }));

    setTimeout(() => {
      setFeedback(null);
      setFlyingItem(null);
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    setShowHint(false);
    setAttempts(0);
    if (gameState.currentQuestionIndex < QUESTIONS.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      setGameState(prev => ({ ...prev, status: 'END' }));
      audioManager.play('victory');
      if (gameState.score >= 45) setShowVictory(true);
    }
  };

  const handleOptionClick = (option: string) => {
    if (feedback) return;
    audioManager.play('ting');
    if (option === currentQuestion.correctAnswer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const resetGame = () => {
    setGameState({
      status: 'START',
      currentQuestionIndex: 0,
      score: 0,
      collectedItems: [],
      userInfo: { name: '', className: '' }
    });
    setAttempts(0);
    setShowHint(false);
    setShowVictory(false);
  };

  const getTitle = (score: number) => {
    if (score === 50) return { text: "👑 Siêu khách hàng vàng", color: "text-yellow-600" };
    if (score >= 30) return { text: "🌟 Người mua hàng thông minh", color: "text-orange-600" };
    return { text: "💪 Cố gắng thêm nhé", color: "text-blue-600" };
  };

  if (gameState.status === 'START') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://picsum.photos/seed/supermarket/1920/1080?blur=5')] bg-cover bg-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border-4 border-super-yellow"
        >
          <div className="text-center mb-8">
            <motion.h1 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl font-bold text-super-orange mb-2"
            >
              🌟 BÉ ĐI SIÊU THỊ 🌟
            </motion.h1>
            <p className="text-gray-600 font-medium">Chào mừng bé đến với siêu thị toán học!</p>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-super-orange font-bold">
                <User size={20} /> Tên của bé:
              </label>
              <input 
                required
                type="text"
                value={gameState.userInfo.name}
                onChange={(e) => setGameState(prev => ({ ...prev, userInfo: { ...prev.userInfo, name: e.target.value } }))}
                className="w-full p-4 rounded-2xl border-2 border-super-yellow focus:outline-none focus:ring-2 ring-super-orange text-lg font-bold"
                placeholder="Nhập tên bé..."
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-super-orange font-bold">
                <School size={20} /> Lớp của bé:
              </label>
              <input 
                required
                type="text"
                value={gameState.userInfo.className}
                onChange={(e) => setGameState(prev => ({ ...prev, userInfo: { ...prev.userInfo, className: e.target.value } }))}
                className="w-full p-4 rounded-2xl border-2 border-super-yellow focus:outline-none focus:ring-2 ring-super-orange text-lg font-bold"
                placeholder="Nhập lớp bé..."
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-super-orange hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-xl"
            >
              BẮT ĐẦU CHƠI <ArrowRight />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (gameState.status === 'END') {
    const title = getTitle(gameState.score);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-super-pastel">
        {showVictory && <Confetti />}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full border-8 border-super-yellow text-center"
        >
          <Trophy className="mx-auto text-super-yellow mb-4" size={80} />
          <h2 className="text-4xl font-bold text-super-orange mb-2">KẾT THÚC CHUYẾN ĐI!</h2>
          <div className="bg-super-pastel p-6 rounded-2xl mb-6 space-y-2">
            <p className="text-xl font-bold">Bé: <span className="text-super-orange">{gameState.userInfo.name}</span></p>
            <p className="text-xl font-bold">Lớp: <span className="text-super-orange">{gameState.userInfo.className}</span></p>
            <div className="flex justify-center items-center gap-4 py-4">
              <div className="text-center">
                <p className="text-gray-500 uppercase text-xs font-bold">Tổng điểm</p>
                <p className="text-5xl font-black text-super-green">{gameState.score}</p>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div className="text-center">
                <p className="text-gray-500 uppercase text-xs font-bold">Món đồ</p>
                <p className="text-5xl font-black text-super-pink">{gameState.collectedItems.length}/5</p>
              </div>
            </div>
            <p className={`text-2xl font-bold ${title.color}`}>{title.text}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {gameState.collectedItems.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl border-2 border-super-yellow"
              >
                {item}
              </motion.div>
            ))}
          </div>

          <button 
            onClick={resetGame}
            className="bg-super-orange hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto text-xl"
          >
            <RotateCcw /> CHƠI LẠI
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-super-pastel p-4 md:p-8 relative overflow-hidden ${isShaking ? 'shake' : ''}`}>
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="grid grid-cols-6 gap-8 p-8">
          {[...Array(24)].map((_, i) => <ShoppingBag key={i} size={48} />)}
        </div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-super-yellow">
            <p className="text-xs font-bold text-gray-500 uppercase">Điểm số</p>
            <p className="text-2xl font-black text-super-orange">{gameState.score}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-super-yellow">
            <p className="text-xs font-bold text-gray-500 uppercase">Tiến trình</p>
            <p className="text-2xl font-black text-super-green">{gameState.currentQuestionIndex + 1}/5</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border-2 ${timeLeft <= 3 ? 'border-red-500 text-red-500 animate-pulse' : 'border-super-yellow'}`}>
            <TimerIcon size={20} />
            <span className="text-xl font-bold">{timeLeft}s</span>
          </div>
          <button 
            onClick={toggleMute}
            className="p-3 bg-white rounded-full shadow-md border-2 border-super-yellow hover:bg-gray-50"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Question Area */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressBar current={gameState.currentQuestionIndex + 1} total={5} />
          
          <motion.div 
            key={gameState.currentQuestionIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl border-4 border-super-yellow min-h-[400px] flex flex-col justify-between relative"
          >
            {feedback === 'correct' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1.5 }}
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              >
                <div className="bg-super-green text-white p-6 rounded-full shadow-2xl">
                  <Star size={60} fill="white" />
                </div>
              </motion.div>
            )}

            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-relaxed">
                {currentQuestion.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionClick(option)}
                    className={`p-6 rounded-2xl text-2xl font-bold transition-all border-4 shadow-md
                      ${feedback === 'correct' && option === currentQuestion.correctAnswer 
                        ? 'bg-super-green border-green-600 text-white' 
                        : 'bg-super-pastel border-super-yellow hover:bg-super-yellow/30 text-gray-700'}`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 p-4 bg-super-pink/20 rounded-2xl border-2 border-super-pink text-super-pink font-bold text-lg"
                >
                  💡 Gợi ý: {currentQuestion.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Character & Cart Area */}
        <div className="space-y-6 flex flex-col items-center">
          <div className="relative">
            {/* Cartoon Baby Placeholder */}
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-48 h-48 bg-super-pink rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden"
            >
              <img 
                src="https://picsum.photos/seed/baby/200/200" 
                alt="Baby" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Flying Item Animation */}
            <AnimatePresence>
              {flyingItem && (
                <motion.div
                  initial={{ scale: 1, x: -300, y: 0, rotate: 0 }}
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    x: 0, 
                    y: 150, 
                    rotate: 720 
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-6xl z-30"
                >
                  {flyingItem}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full bg-white p-6 rounded-3xl shadow-xl border-4 border-super-orange">
            <div className="flex items-center gap-2 mb-4 text-super-orange font-bold">
              <ShoppingCart /> GIỎ HÀNG CỦA BÉ
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="aspect-square bg-super-pastel rounded-xl border-2 border-dashed border-super-orange flex items-center justify-center text-2xl"
                >
                  {gameState.collectedItems[i] || ""}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl text-center w-full border-2 border-super-yellow">
            <p className="text-sm font-bold text-gray-500">PHẦN THƯỞNG ĐANG CHỜ:</p>
            <p className="text-lg font-bold text-super-orange">{currentQuestion.reward}</p>
          </div>
        </div>
      </div>

      {/* Feedback Overlays */}
      <AnimatePresence>
        {feedback === 'wrong' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-red-500 text-white p-8 rounded-full shadow-2xl flex flex-col items-center">
              <span className="text-6xl mb-2">😢</span>
              <span className="text-2xl font-bold">Sai rồi bé ơi!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
