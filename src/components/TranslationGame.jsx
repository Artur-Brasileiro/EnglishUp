'use client';

import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { 
  Languages, ArrowLeft, CheckCircle, XCircle, Mic, 
  Clock, GitBranch, Shield, ArrowLeftRight, Flame, Target, Scale, Heart, Lock, Lightbulb, Sparkles, HelpCircle, Trophy, BookOpen 
} from 'lucide-react'; 

import { loadGameData } from '../utils/dataLoader';
import { shuffleArray } from '../utils/arrayUtils';

import AdUnit from './ads/AdUnit'; 
import { useH5Ads } from '../hooks/useH5Ads'; 
import PageShell from './layout/PageShell';
import ResultScreen from './shared/ResultScreen';
import TranslationEducation from '../content/TranslationEducation';
import StructureExplanation from '../content/StructureExplanation'; 
import { normalizeSentence } from '../utils/textUtils';

const ITEMS_PER_LEVEL = 10; 

// --- HELPERS DE SEGURANÇA E VALIDAÇÃO ---
const getAnswers = (entry) => {
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;
  if (typeof entry === 'string') return [entry];
  return [];
};

const normalizeStrict = (text) => {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ') 
    .toLowerCase();
};

const normalizeFlexible = (text) => {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
    .replace(/[.,!?;:()"]/g, '') 
    .replace(/-/g, ' ')          
    .replace(/\s+/g, ' ')        
    .trim();
};

const TranslationGame = ({ onBack }) => {
  const router = useRouter();
  const params = useParams();
  const levelId = params?.levelId;

  const { triggerAdBreak } = useH5Ads();
  
  // Refs
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const structureRef = useRef(null);
  const educationRef = useRef(null);

  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState('loading'); 
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentMode, setCurrentMode] = useState('mix'); 
  const [userAnswer, setUserAnswer] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null); 
  const [isListening, setIsListening] = useState(false);

  // Metadados das tags
  const tagMeta = useMemo(() => ({
    conditional: { label: 'Condicionais', sub: 'If/Se', color: 'bg-amber-500', icon: GitBranch },
    concessive: { label: 'Concessivas', sub: 'Even/Embora', color: 'bg-teal-600', icon: Shield },
    temporal: { label: 'Temporais', sub: 'While/When', color: 'bg-cyan-600', icon: Clock },
    contrast: { label: 'Contraste', sub: 'Mas/Porém', color: 'bg-rose-500', icon: ArrowLeftRight },
    cause: { label: 'Causa', sub: 'Porque', color: 'bg-lime-600', icon: Flame },
    purpose: { label: 'Finalidade', sub: 'Para que', color: 'bg-emerald-600', icon: Target },
    result: { label: 'Resultado', sub: 'Então', color: 'bg-blue-600', icon: CheckCircle },
    comparison: { label: 'Comparação', sub: 'Igual a', color: 'bg-violet-600', icon: Scale },
    desire: { label: 'Desejo', sub: 'Quero/Espero', color: 'bg-fuchsia-500', icon: Heart },
    obligation: { label: 'Obrigação', sub: 'Tenho que', color: 'bg-orange-600', icon: Lock },
    advice: { label: 'Conselho', sub: 'Deveria', color: 'bg-sky-600', icon: Lightbulb },
    suggestion: { label: 'Sugestão', sub: 'Que tal', color: 'bg-indigo-600', icon: Sparkles },
    possibility: { label: 'Possibilidade', sub: 'Talvez', color: 'bg-slate-600', icon: HelpCircle }
  }), []);

  // Metadados de Gramática
  const grammarMeta = {
    present_perfect: { label: 'Present Perfect', color: 'bg-blue-500' },
    past_perfect: { label: 'Past Perfect', color: 'bg-purple-500' }, 
    future_perfect: { label: 'Future Perfect', color: 'bg-indigo-600' }, 
    questions: { label: 'Perguntas', color: 'bg-cyan-600' },
    all_tenses: { label: 'All Tenses', color: 'bg-slate-800' }
  };

  useEffect(() => {
    loadGameData('translation.json')
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erro ao carregar traduções.");
        setLoading(false);
      });
  }, []);

  const safeEnsureArray = (val) => Array.isArray(val) ? val : [val];

  const taggedItems = useMemo(() => data ? safeEnsureArray(data.tagged) : [], [data]);
  const allTranslationItems = useMemo(() => data ? Object.values(data).flatMap(safeEnsureArray) : [], [data]);
  
  const stopAllAudio = () => {
    if (recognitionRef.current) recognitionRef.current.abort();
    setIsListening(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleBackToMenu = () => {
    triggerAdBreak('next', 'return_menu', () => {
        stopAllAudio();
        setView('menu');
        router.replace('/translation');
    }, stopAllAudio);
  };

  const scrollToStructure = () => {
    if (structureRef.current) structureRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToEducation = () => {
    if (educationRef.current) educationRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Lógica de Rota
  useLayoutEffect(() => {
    if (!loading && data) {
      if (levelId) {
        const isNumeric = /^\d+$/.test(levelId);
        startGame(isNumeric ? parseInt(levelId) : levelId);
      } else {
        setView('menu');
        stopAllAudio();
      }
    }
  }, [levelId, loading, data]);

  // Título Dinâmico
  useEffect(() => {
    if (view === 'game') {
      const titlePrefix = typeof currentMode === 'number' ? `Nível ${currentMode}` : 'Treino';
      document.title = `${titlePrefix} | Translation - EnglishUp`;
    } else {
      document.title = 'Translation Master | EnglishUp';
    }
  }, [currentMode, view]);

  useEffect(() => {
    if (view === 'game' && !answerStatus && inputRef.current && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentQuestionIndex, view, answerStatus]);

  // --- VALIDAÇÃO ESTRITA ---
  const checkAnswer = () => {
    if (answerStatus) return;
    
    const currentItem = shuffledQuestions[currentQuestionIndex];
    const possibleAnswers = getAnswers(currentItem?.en);
    const userClean = normalizeFlexible(userAnswer);
    
    const isCorrect = possibleAnswers.some(correctOption => {
      return normalizeFlexible(correctOption) === userClean;
    });

    if (isCorrect) {
      setAnswerStatus('correct');
      setScore(s => s + 1);
    } else {
      setAnswerStatus('incorrect');
    }
  };

  const startGame = (modeOrLevel) => {
    if (!data) return; 

    setCurrentMode(modeOrLevel);
    let dataToUse = [];

    if (typeof modeOrLevel === 'number') {
        const startIndex = (modeOrLevel - 1) * ITEMS_PER_LEVEL;
        const endIndex = startIndex + ITEMS_PER_LEVEL;
        dataToUse = allTranslationItems.slice(startIndex, endIndex);
    } else {
        const mode = modeOrLevel;
        if (tagMeta[mode]) {
            dataToUse = taggedItems.filter(item => item.tags && item.tags.includes(mode));
        } else if (data[mode]) {
            dataToUse = safeEnsureArray(data[mode]);
        } else if (mode === 'all_tenses') {
             dataToUse = allTranslationItems;
        } else {
             dataToUse = allTranslationItems.slice(0, ITEMS_PER_LEVEL);
        }
    }
    
    if (dataToUse.length === 0) {
      console.warn(`Modo ${modeOrLevel} não encontrado ou vazio.`);
      router.replace('/translation');
      return;
    }

    setShuffledQuestions(shuffleArray(dataToUse));
    setCurrentQuestionIndex(0);
    setScore(0);
    setView('game'); 
    resetTurn();
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const resetTurn = () => {
    setUserAnswer('');
    setAnswerStatus(null);
    setIsListening(false);
  };

  const handleSpeech = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Seu navegador não suporta voz.");

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let transcript = e.results[0][0].transcript;
      if (transcript.endsWith('.')) {
        transcript = transcript.slice(0, -1);
      }
      setUserAnswer(transcript); 
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetTurn();
    } else {
      triggerAdBreak('next', 'game_complete', () => setView('result'), stopAllAudio);
    }
  };

  const restartLevel = () => {
      if (levelId) {
          const isNumeric = /^\d+$/.test(levelId);
          startGame(isNumeric ? parseInt(levelId) : levelId);
      } else {
          startGame(currentMode);
      }
  };

  const getPrimaryTag = (tags = []) => tags.find((tag) => Object.keys(tagMeta).includes(tag));

  const detectGrammarCategory = (item) => {
    if (!data) return null;
    const grammarKeys = ['future_perfect', 'past_perfect', 'present_perfect', 'questions'];
    for (const key of grammarKeys) {
        if (data[key] && Array.isArray(data[key])) {
            if (data[key].some(i => i.id === item.id)) {
                return key;
            }
        }
    }
    return null;
  };
  
  const getFocusStyle = (bgClass) => {
    const map = {
        'bg-amber-500': 'focus:border-amber-500 focus:ring-amber-50',
        'bg-teal-600': 'focus:border-teal-600 focus:ring-teal-50',
        'bg-cyan-600': 'focus:border-cyan-600 focus:ring-cyan-50',
        'bg-rose-500': 'focus:border-rose-500 focus:ring-rose-50',
        'bg-lime-600': 'focus:border-lime-600 focus:ring-lime-50',
        'bg-emerald-600': 'focus:border-emerald-600 focus:ring-emerald-50',
        'bg-blue-600': 'focus:border-blue-600 focus:ring-blue-50',
        'bg-violet-600': 'focus:border-violet-600 focus:ring-violet-50',
        'bg-fuchsia-500': 'focus:border-fuchsia-500 focus:ring-fuchsia-50',
        'bg-orange-600': 'focus:border-orange-600 focus:ring-orange-50',
        'bg-sky-600': 'focus:border-sky-600 focus:ring-sky-50',
        'bg-indigo-600': 'focus:border-indigo-600 focus:ring-indigo-50',
        'bg-slate-600': 'focus:border-slate-600 focus:ring-slate-50',
        'bg-blue-500': 'focus:border-blue-500 focus:ring-blue-50',
        'bg-purple-500': 'focus:border-purple-500 focus:ring-purple-50',
        'bg-slate-800': 'focus:border-slate-800 focus:ring-slate-200',
        'bg-emerald-500': 'focus:border-emerald-500 focus:ring-emerald-50',
    };
    return map[bgClass] || 'focus:border-blue-500 focus:ring-blue-50';
  };

  // ================= RENDER =================

  if (loading) {
    return (
      <PageShell title="Translation Master" icon={Languages} iconColorClass="bg-emerald-100 text-emerald-600">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium">Carregando traduções...</p>
        </div>
      </PageShell>
    );
  }

  if (error) {
     return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
  }

  if (view === 'menu') {
    return (
      <PageShell
        title="Translation Master"
        description="O treino definitivo para você parar de travar. Aprenda a pensar em inglês traduzindo frases reais do dia a dia."
        icon={Languages}
        iconColorClass="bg-emerald-100 text-emerald-600"
        onMethodologyClick={scrollToEducation} 
      >
        <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-4 text-left pl-2 border-l-4 border-emerald-500">
           Modos de Treino
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
             {/* 1. Categorias Tags (Condicionais, etc) */}
             {Object.entries(tagMeta).map(([key, meta]) => (
                 <button key={key} onClick={() => router.push(`/translation/level/${key}`)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:border-emerald-400 transition-all flex items-center gap-4 group text-left">
                    <div className={`p-3 rounded-lg text-white ${meta.color} group-hover:scale-110 transition-transform`}>
                       <meta.icon className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-800 text-lg">{meta.label}</h4>
                       <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{meta.sub}</span>
                    </div>
                </button>
             ))}

             {/* 2. Present Perfect */}
             <button onClick={() => router.push(`/translation/level/present_perfect`)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all flex items-center gap-4 group text-left">
                  <div className="p-3 rounded-lg text-white bg-blue-500 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-slate-800">Present Perfect</h4></div>
             </button>

             {/* 3. Past Perfect */}
             <button onClick={() => router.push(`/translation/level/past_perfect`)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:border-purple-400 transition-all flex items-center gap-4 group text-left">
                  <div className="p-3 rounded-lg text-white bg-purple-500 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-slate-800">Past Perfect</h4></div>
             </button>

             {/* 4. Future Perfect */}
             <button onClick={() => router.push(`/translation/level/future_perfect`)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all flex items-center gap-4 group text-left">
                  <div className="p-3 rounded-lg text-white bg-indigo-600 group-hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-slate-800">Future Perfect</h4></div>
             </button>

             {/* 5. Questions */}
             <button onClick={() => router.push(`/translation/level/questions`)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:border-cyan-400 transition-all flex items-center gap-4 group text-left">
                  <div className="p-3 rounded-lg text-white bg-cyan-600 group-hover:scale-110 transition-transform"><HelpCircle className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-slate-800">Perguntas</h4></div>
             </button>

             {/* 6. All Tenses */}
             <button onClick={() => router.push(`/translation/level/all_tenses`)} className="bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:shadow-lg hover:border-slate-600 transition-all flex items-center gap-4 group text-left">
                  <div className="p-3 rounded-lg text-white bg-slate-800 group-hover:scale-110 transition-transform"><Flame className="w-6 h-6" /></div>
                  <div><h4 className="font-bold text-slate-800">All Tenses</h4></div>
             </button>
        </div>

        <div ref={educationRef}>
            <TranslationEducation />
        </div>
      </PageShell>
    );
  }

  if (view === 'result') {
    return (
      <ResultScreen 
        score={score}
        total={shuffledQuestions.length}
        subtitle={typeof currentMode === 'number' ? `Nível ${currentMode}` : `Modo: ${currentMode}`}
        onRetry={() => triggerAdBreak('next', 'game_retry', restartLevel, stopAllAudio)}
        onBack={handleBackToMenu}
        colorClass="text-emerald-500"
        btnColorClass="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
      />
    );
  }

  const currentItem = shuffledQuestions[currentQuestionIndex];
  if (!currentItem) return <div className="min-h-screen flex items-center justify-center animate-pulse text-slate-400 font-bold">Carregando nível...</div>;

  // Lógica de Cores do Header
  let questionType = 'mix';
  if (currentMode && tagMeta[currentMode]) {
    questionType = currentMode;
  } else {
    const primaryTag = getPrimaryTag(currentItem.tags);
    if (primaryTag) {
      questionType = primaryTag;
    } else {
      const detectedGrammar = detectGrammarCategory(currentItem);
      if (detectedGrammar) {
          questionType = detectedGrammar;
      } else if (typeof currentMode === 'string' && grammarMeta[currentMode]) {
          questionType = currentMode;
      }
    }
  }

  let headerColor = 'bg-emerald-500';
  let HeaderIcon = Languages; 
  let headerTitle = 'Traduza';
  
  if (tagMeta[questionType]) {
      headerColor = tagMeta[questionType].color;
      HeaderIcon = tagMeta[questionType].icon; 
      headerTitle = tagMeta[questionType].label;
  } else if (grammarMeta[questionType]) {
      headerColor = grammarMeta[questionType].color;
      headerTitle = grammarMeta[questionType].label;
      if (questionType === 'questions') HeaderIcon = HelpCircle;
      else if (questionType === 'all_tenses') HeaderIcon = Flame;
      else HeaderIcon = CheckCircle;
  }

  const focusStyle = getFocusStyle(headerColor);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col items-center">
      {/* HEADER AD */}
      <div className="w-full bg-white border-b border-slate-200 py-2 flex flex-col items-center justify-center relative z-20 shadow-sm min-h-25">
         <div className="block md:hidden"><AdUnit key={`mob-top`} slotId="8330331714" width="320px" height="100px" label="Patrocinado"/></div>
         <div className="hidden md:block"><AdUnit slotId="5673552248" width="728px" height="90px" label="Patrocinado"/></div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row justify-center items-start gap-8 p-4 mt-4">
          
          {/* SIDEBAR ESQUERDA */}
          <div className="hidden xl:flex w-80 shrink-0 flex-col gap-4 sticky top-36">
             <AdUnit key={`desk-left`} slotId="5118244396" width="300px" height="600px" label="Patrocinado"/>
          </div>

          {/* ÁREA CENTRAL */}
          <div className="w-full max-w-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
               <button onClick={handleBackToMenu} className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
                 <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-bold uppercase tracking-wide">Menu</span>
               </button>

               <button 
                  onClick={scrollToStructure}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors text-sm"
               >
                  <BookOpen className="w-4 h-4" /> 
                  <span className="hidden sm:inline">Aprender Estrutura</span>
                  <span className="sm:hidden">Aprender</span>
               </button>

               <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                 {currentQuestionIndex + 1} / {shuffledQuestions.length}
               </span>
            </div>

            {/* CARD DO JOGO */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative mb-8">
              <div className={`${headerColor} p-8 text-center min-h-40 flex flex-col items-center justify-center transition-colors duration-500`}>
                <span className="text-white/80 uppercase tracking-widest text-xs font-bold mb-3 flex items-center gap-2 justify-center">
                  <HeaderIcon className="w-4 h-4" /> {headerTitle}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight max-w-lg mx-auto">
                  "{currentItem.pt}"
                </h2>
              </div>

              <div className="p-6 md:p-10">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Sua Tradução</label>
                <div className="flex gap-2 mb-6">
                  <div className="relative grow" key={currentQuestionIndex}>
                    <textarea 
                      ref={inputRef}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={answerStatus !== null}
                      placeholder="Digite exatamente como no inglês..."
                      rows={2}
                      className={`w-full p-4 rounded-xl border-2 outline-none font-medium text-lg resize-none transition-all ${
                          answerStatus === 'correct' ? "border-green-500 bg-green-50 text-green-700" : 
                          answerStatus === 'incorrect' ? "border-red-500 bg-red-50 text-red-700" :
                          `border-slate-300 focus:ring-4 ${focusStyle}` 
                      }`}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !answerStatus) { e.preventDefault(); checkAnswer(); } }}
                    />
                    {answerStatus && (
                      <div className="absolute right-3 top-3">
                        {answerStatus === 'correct' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleSpeech} disabled={answerStatus !== null}
                    className={`p-4 rounded-xl border-2 transition-all h-22 w-22 flex items-center justify-center ${isListening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                </div>

                <div className="pt-2">
                  {!answerStatus ? (
                    <button onClick={checkAnswer} disabled={!userAnswer.trim()} className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${!userAnswer.trim() ? 'bg-slate-200 text-slate-400' : 'bg-slate-800 text-white'}`}>Verificar</button>
                  ) : (
                    <div className="animate-fadeIn">
                       {answerStatus === 'incorrect' && (
                          <div className="mb-4 bg-red-50 p-4 rounded-xl border border-red-100">
                            <span className="block text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Resposta Esperada:</span>
                            <p className="text-red-700 font-bold text-lg">
                              "{getAnswers(currentItem.en)[0] || 'Erro: Resposta não encontrada'}"
                            </p>     
                          </div>
                       )}
                       <button onClick={nextQuestion} className={`w-full text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg ${answerStatus === 'correct' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                        {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Próxima' : 'Ver Resultados'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <TranslationEducation forceSingleColumn={true} />
            
            <div className="w-full my-16 flex flex-col items-center justify-center pointer-events-auto relative">
              <div className="w-full border-t border-slate-100 mb-8"></div>
              <AdUnit slotId="4391086704" width="336px" height="280px" label="Publicidade"/>
              <div className="w-full border-t border-slate-100 mt-8"></div>
            </div>

            <div ref={structureRef} className="pt-8">
                {/* Aqui passamos 'questionType' para a explicação de estrutura */}
                <StructureExplanation mode={questionType} />
            </div>
            
          </div>

          {/* SIDEBAR DIREITA */}
          <div className="hidden xl:flex w-80 shrink-0 flex-col gap-4 sticky top-36">
             <AdUnit key={`desk-right`} slotId="3805162724" width="300px" height="250px" label="Patrocinado"/>
             
             <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                   <Lightbulb className="w-4 h-4" /> Dica de Mestre
                </h3>
                <p className="text-sm text-blue-700/80 leading-relaxed">
                   Se tiver dúvidas sobre a regra gramatical, consulte a seção <strong>"Aprender Estrutura"</strong> logo abaixo do jogo.
                </p>
             </div>
          </div>
      </div>

      {/* MOBILE AD */}
      <div className="xl:hidden w-full flex flex-col items-center pb-8 bg-slate-50 mt-4 min-h-62.5">
          <AdUnit key={`mob-bot`} slotId="3477859667" width="300px" height="250px" label="Patrocinado"/>
      </div>
    </div>
  );
};

export default TranslationGame;