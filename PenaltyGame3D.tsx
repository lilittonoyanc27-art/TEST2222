import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types & Data ---

interface Question {
  sentence: string;
  translation: string;
  correct: string;
  options: string[];
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    sentence: "Yo ___ a María desde hace años.",
    translation: "Ես ճանաչում եմ Մարիային արդեն տարիներ:",
    correct: "conozco",
    options: ["sé", "conozco", "saben", "conocemos"],
    explanation: "Conocer oգտագործվում է մարդկանց ճանաչելու համար:"
  },
  {
    sentence: "¿___ tú dónde está el cine?",
    translation: "Գիտե՞ս դու, թե որտեղ է կինոթատրոնը:",
    correct: "Sabes",
    options: ["Sabes", "Conoces", "Saben", "Conocen"],
    explanation: "Saber օգտագործվում է տեղեկատվություն կամ փաստեր իմանալու համար:"
  },
  {
    sentence: "Él no ___ hablar italiano.",
    translation: "Նա չգիտի (չի կարողանում) իտալերեն խոսել:",
    correct: "sabe",
    options: ["conoce", "sabe", "sabes", "conocemos"],
    explanation: "Saber + անորոշ դերբայ նշանակում է հմտություն ունենալ:"
  },
  {
    sentence: "Nosotros ___ Madrid muy bien.",
    translation: "Մենք շատ լավ ճանաչում ենք (եղել ենք) Մադրիդը:",
    correct: "conocemos",
    options: ["sabemos", "conocemos", "conozco", "sé"],
    explanation: "Conocer օգտագործվում է վայրեր ճանաչելու համար:"
  },
  {
    sentence: "¿___ ustedes a mi hermano?",
    translation: "Դուք ճանաչո՞ւմ եք իմ եղբորը:",
    correct: "Conocen",
    options: ["Saben", "Conocen", "Conocemos", "Sabemos"],
    explanation: "Conocer օգտագործվում է մարդկանց ճանաչելու համար:"
  },
  {
    sentence: "Yo ___ tocar la guitarra.",
    translation: "Ես գիտեմ (կարողանում եմ) կիթառ նվագել:",
    correct: "sé",
    options: ["conozco", "sé", "sabemos", "conocemos"],
    explanation: "Saber օգտագործվում է հմտությունների համար:"
  }
];

// --- 3D Components ---

const HumanCharacter = ({ position, action, color, hairColor = "#4b2e0e", isCurly = false }: any) => {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (action === 'running') {
      group.current!.position.x = Math.sin(t * 2) * 5;
      group.current!.rotation.y = Math.cos(t * 2) > 0 ? Math.PI / 2 : -Math.PI / 2;
      group.current!.position.y = Math.abs(Math.sin(t * 10)) * 0.2;
      
      leftArm.current!.rotation.x = Math.sin(t * 10) * 0.5;
      rightArm.current!.rotation.x = -Math.sin(t * 10) * 0.5;
    } else if (action === 'celebrating') {
      group.current!.position.y = Math.abs(Math.sin(t * 15)) * 1 + 0.5;
      leftArm.current!.rotation.z = Math.PI * 0.7;
      rightArm.current!.rotation.z = -Math.PI * 0.7;
    } else {
      group.current!.position.y = 0;
      leftArm.current!.rotation.z = 0.2;
      rightArm.current!.rotation.z = -0.2;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Body */}
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh ref={head} position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fdbf9c" />
        
        {/* Face (Simple eyes/mouth) */}
        <mesh position={[0.1, 0.05, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        
        {/* Hair */}
        <group position={[0, 0.15, 0]}>
          {isCurly ? (
            Array.from({ length: 12 }).map((_, i) => (
              <mesh key={i} position={[Math.sin(i) * 0.2, Math.cos(i) * 0.1, Math.cos(i * 1.5) * 0.15]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color={hairColor} />
              </mesh>
            ))
          ) : (
            <mesh>
              <sphereGeometry args={[0.27, 16, 16]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
          )}
        </group>
      </mesh>

      {/* Arms */}
      <mesh ref={leftArm} position={[-0.4, 1.5, 0]}>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <meshStandardMaterial color="#fdbf9c" />
      </mesh>
      <mesh ref={rightArm} position={[0.4, 1.5, 0]}>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <meshStandardMaterial color="#fdbf9c" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, 0.4, 0]}>
        <capsuleGeometry args={[0.1, 0.8, 4, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.15, 0.4, 0]}>
        <capsuleGeometry args={[0.1, 0.8, 4, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
};

const SoccerBall = ({ shoot, target }: { shoot: boolean, target: THREE.Vector3 | null }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const startPos = new THREE.Vector3(0, 0.2, 10);

  useFrame((state) => {
    if (shoot && target && mesh.current) {
      mesh.current.position.lerp(target, 0.1);
      mesh.current.rotation.x += 0.5;
      mesh.current.rotation.y += 0.5;
    } else if (!shoot && mesh.current) {
      mesh.current.position.copy(startPos);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0.2, 10]} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="white" roughness={0.3} metalness={0.1} />
      {/* Black patches wrap */}
      <mesh>
        <sphereGeometry args={[0.205, 12, 12]} />
        <meshStandardMaterial color="black" wireframe />
      </mesh>
    </mesh>
  );
};

const Goal = () => (
  <group position={[0, 0, -5]}>
    {/* Frame */}
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[10, 0.2, 0.2]} />
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={[-5, 1, 0]}>
      <boxGeometry args={[0.2, 4, 0.2]} />
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={[5, 1, 0]}>
      <boxGeometry args={[0.2, 4, 0.2]} />
      <meshStandardMaterial color="white" />
    </mesh>
    {/* Net */}
    <mesh position={[0, 2, -1]}>
      <boxGeometry args={[10, 4, 2]} />
      <meshStandardMaterial color="white" wireframe opacity={0.3} transparent />
    </mesh>
  </group>
);

// --- Main App ---

export default function PenaltyGame3D() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [view, setView] = useState<'intro' | 'question' | 'game' | 'feedback' | 'finish'>('intro');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [gameStatus, setGameStatus] = useState<'idle' | 'shooting' | 'goal' | 'miss'>('idle');
  const [ballTarget, setBallTarget] = useState<THREE.Vector3 | null>(null);
  const [pedroAction, setPedroAction] = useState<'idle' | 'running' | 'celebrating'>('idle');
  
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const correct = option === QUESTIONS[currentIdx].correct;
    setIsCorrect(correct);
    setAttempts(a => a + 1);

    if (correct) {
      setScore(s => s + 1);
      setPedroAction('running');
      setTimeout(() => setView('game'), 1000);
    } else {
      setPedroAction('celebrating');
      setTimeout(() => setView('feedback'), 1500);
    }
  };

  const kick = (x: number, y: number) => {
    if (gameStatus !== 'idle') return;
    
    setGameStatus('shooting');
    const target = new THREE.Vector3(x, y, -5);
    setBallTarget(target);

    // Simulated Goal Check
    setTimeout(() => {
      const isGoal = Math.abs(x) < 4.5 && y > 0 && y < 3.8;
      if (isGoal) {
        setGameStatus('goal');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setGameStatus('miss');
      }
      
      setTimeout(() => {
        setView('feedback');
        setGameStatus('idle');
        setBallTarget(null);
      }, 1500);
    }, 500);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(i => i + 1);
      setView('question');
      setSelectedOption(null);
      setIsCorrect(null);
      setPedroAction('idle');
    } else {
      setView('finish');
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-white font-sans overflow-hidden flex flex-col">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 20], fov: 45 }}>
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight position={[0, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
            
            {/* Field */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#2d5a27" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.5]}>
              <planeGeometry args={[12, 25]} />
              <meshStandardMaterial color="#3a7a33" />
            </mesh>

            {/* Goal Posts */}
            <Goal />

            {/* Pedro (Human Defender) */}
            <HumanCharacter 
              position={[0, 0, -3]} 
              action={pedroAction} 
              color="#3498db" 
              hairColor="#000"
            />

            {/* Goalkeeper (Human with Curly Hair) */}
            <HumanCharacter 
              position={[Math.sin(Date.now() * 0.002) * 3, 0, -4.5]} 
              action="idle" 
              color="#f1c40f" 
              hairColor="#4b2e0e" 
              isCurly={true} 
            />

            {/* User Ball */}
            {view === 'game' && (
              <SoccerBall shoot={gameStatus === 'shooting'} target={ballTarget} />
            )}

            <Environment preset="night" />
            {view === 'intro' && <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />}
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex-1 flex flex-col pointer-events-none">
        
        {/* HUD */}
        <header className="p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
             <Trophy className="text-yellow-400" />
             <h1 className="text-2xl font-black italic tracking-tighter">SABER <span className="text-yellow-400">CONOCER</span> 3D</h1>
          </div>
          <div className="bg-black/40 backdrop-blur rounded-xl px-4 py-2 border border-white/10">
             <p className="text-xs opacity-50 font-bold uppercase">Գոլեր</p>
             <p className="text-xl font-black">{score}/{attempts}</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center pointer-events-auto overflow-y-auto px-4">
          <AnimatePresence mode="wait">
            
            {view === 'intro' && (
              <motion.div 
                key="intro"
                className="text-center space-y-8"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              >
                <div className="space-y-2">
                  <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none">PENALTY<br/><span className="text-blue-500">ARENA</span></h2>
                  <p className="text-blue-200 opacity-60 font-medium">Պեդրոն սպասում է քեզ դաշտում։ Անցիր թեստը և խփիր քո գոլը։</p>
                </div>
                <button 
                  onClick={() => setView('question')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-full font-black text-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all uppercase italic"
                >
                  ՍԿՍԵԼ <ChevronRight className="inline ml-2"/>
                </button>
              </motion.div>
            )}

            {view === 'question' && (
              <motion.div 
                key="question"
                className="w-full max-w-2xl space-y-6"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl">
                   <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">ՀԱՐՑ {currentIdx + 1}/{QUESTIONS.length}</div>
                   <h2 className="text-4xl md:text-5xl font-black italic leading-tight text-white mb-2">
                      {QUESTIONS[currentIdx].sentence.replace('___', ' _____ ')}
                   </h2>
                   <p className="text-xl opacity-50 italic">{QUESTIONS[currentIdx].translation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {QUESTIONS[currentIdx].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedOption !== null}
                        className={`p-6 rounded-2xl font-black text-xl transition-all border-b-4 
                          ${selectedOption === opt 
                            ? (opt === QUESTIONS[currentIdx].correct ? 'bg-emerald-600 border-emerald-800' : 'bg-rose-600 border-rose-800 focus:ring-0')
                            : 'bg-white/10 hover:bg-white/20 border-white/5 text-white backdrop-blur-xl'}
                        `}
                      >
                         {opt}
                      </button>
                   ))}
                </div>
              </motion.div>
            )}

            {view === 'game' && (
              <motion.div 
                key="game"
                className="relative w-full h-[60vh] flex flex-col items-center justify-end pb-12"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                 <div className="absolute top-0 text-center space-y-2 pointer-events-none">
                    <h3 className="bg-blue-600 text-white px-6 py-2 rounded-full font-black italic animate-bounce shadow-xl">ԽՓԻ՛Ր ԳՈԼԸ!</h3>
                    <p className="text-sm opacity-60">Սեղմիր դարպասի ցանկացած թիրախի վրա</p>
                 </div>

                 {/* Click Targets for Shooting */}
                 <div className="absolute top-1/4 w-[60%] h-[30%] grid grid-cols-3 gap-0">
                    <button onClick={() => kick(-4, 2)} className="hover:bg-blue-500/20 rounded-tl-xl transition-colors border border-white/5" />
                    <button onClick={() => kick(0, 3)} className="hover:bg-blue-500/20 transition-colors border border-white/5" />
                    <button onClick={() => kick(4, 2)} className="hover:bg-blue-500/20 rounded-tr-xl transition-colors border border-white/5" />
                    <button onClick={() => kick(-3, 1)} className="hover:bg-blue-500/20 transition-colors border border-white/5" />
                    <button onClick={() => kick(0, 1)} className="hover:bg-blue-500/20 transition-colors border border-white/5" />
                    <button onClick={() => kick(3, 1)} className="hover:bg-blue-500/20 transition-colors border border-white/5" />
                 </div>
              </motion.div>
            )}

            {view === 'feedback' && (
              <motion.div 
                key="feedback"
                className="max-w-xl w-full"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              >
                <div className={`p-10 rounded-3xl border-2 backdrop-blur-3xl text-center space-y-6 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-rose-500/10 border-rose-500/50'}`}>
                   <div className="flex justify-center">
                     {isCorrect ? <CheckCircle2 size={64} className="text-emerald-500" /> : <XCircle size={64} className="text-rose-500" />}
                   </div>
                   <h2 className="text-5xl font-black italic uppercase">{isCorrect ? 'ՃԻՇՏ Է!' : 'ՍԽԱԼ Է!'}</h2>
                   <p className="text-xl opacity-80">{QUESTIONS[currentIdx].explanation}</p>
                   <button 
                     onClick={nextQuestion}
                     className="bg-white text-slate-950 px-12 py-4 rounded-full font-black uppercase text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all w-full mt-4"
                   >
                     ՇԱՐՈՒՆԱԿԵԼ
                   </button>
                </div>
              </motion.div>
            )}

            {view === 'finish' && (
              <motion.div 
                key="finish"
                className="text-center space-y-10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <Trophy size={120} className="text-yellow-400 mx-auto" />
                <div className="space-y-4">
                  <h2 className="text-7xl font-black italic uppercase tracking-tighter">ԽԱՂԻ ԱՎԱՐՏ</h2>
                  <p className="text-3xl font-black text-blue-400 italic">ԱՐԴՅՈՒՆՔ՝ {score} / {QUESTIONS.length}</p>
                </div>
                <button 
                  onClick={() => { setView('intro'); setCurrentIdx(0); setScore(0); setAttempts(0); }}
                  className="bg-white text-slate-950 px-16 py-6 rounded-full font-black uppercase text-xl italic"
                >
                  <RotateCcw className="inline mr-2" /> ՆՈՐԻՑ
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <footer className="p-6 text-center text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
           FOOTBALL ACADEMY • SABER VS CONOCER • 3D SIMULATION
        </footer>
      </div>
    </div>
  );
}
