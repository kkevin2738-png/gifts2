
import React, { useState, useCallback, useMemo } from 'react';

// --- Configuration ---
const INITIAL_PRIZES_CONFIG = [
    { id: 1, name: '경품 1', total: 10 },
    { id: 2, name: '경품 2', total: 10 },
    { id: 3, name: '경품 3', total: 10 },
    { id: 4, name: '경품 4', total: 10 },
];

const DRAW_OPTIONS = [1, 2, 3, 4, 5, 10];
const PRIZE_COLORS = ['bg-yellow-500 text-white', 'bg-sky-500 text-white', 'bg-rose-500 text-white', 'bg-lime-500 text-white'];
const DRAW_BUTTON_COLORS = [
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-sky-500 hover:bg-sky-600',
    'bg-rose-500 hover:bg-rose-600',
    'bg-lime-500 hover:bg-lime-600',
];


// --- Helper Components ---
const Confetti: React.FC = () => {
    const confettiPieces = useMemo(() => {
        const pieces = [];
        const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b'];
        for (let i = 0; i < 50; i++) {
            const style = {
                left: `${Math.random() * 100}%`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: `${Math.random() * 4}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
            };
            pieces.push(<div key={i} className="confetti-piece" style={style}></div>);
        }
        return pieces;
    }, []);
    return <div className="confetti">{confettiPieces}</div>;
};

const SpeechBubble: React.FC = () => (
    <div className="absolute top-10 -right-20 w-40 h-28 transform -rotate-12 animate-bounce-slow drop-shadow-lg z-10 pointer-events-none">
        <svg viewBox="0 0 150 120" className="w-full h-full">
            <g transform="translate(1,1)">
                <path d="M10,20 C0,20,0,45,15,50 C10,60,20,70,30,70 C40,80,60,85,75,80 C90,85,110,80,120,70 C130,65,145,55,140,40 C145,25,130,10,115,15 C100,5,80,10,65,15 C50,10,30,5,20,15 C10,20,10,20,10,20Z" fill="black" fillOpacity="0.1" />
                <path d="M30,68 C25,78,20,88,23,93 C27,98,37,88,33,82Z" fill="black" fillOpacity="0.1" />
                <circle cx="25" cy="98" r="5" fill="black" fillOpacity="0.1"/>
                <circle cx="20" cy="108" r="3" fill="black" fillOpacity="0.1"/>
                <circle cx="15" cy="113" r="2" fill="black" fillOpacity="0.1"/>
            </g>
            <path d="M10,20 C0,20,0,45,15,50 C10,60,20,70,30,70 C40,80,60,85,75,80 C90,85,110,80,120,70 C130,65,145,55,140,40 C145,25,130,10,115,15 C100,5,80,10,65,15 C50,10,30,5,20,15 C10,20,10,20,10,20Z" fill="white" stroke="#f472b6" strokeWidth="4" />
            <path d="M30,68 C25,78,20,88,23,93 C27,98,37,88,33,82Z" fill="white" stroke="#f472b6" strokeWidth="4" />
            <circle cx="24" cy="97" r="5" fill="white" stroke="#f472b6" strokeWidth="3"/>
            <circle cx="19" cy="107" r="3" fill="white" stroke="#f472b6" strokeWidth="2"/>
            <circle cx="14" cy="112" r="2" fill="white" stroke="#f472b6" strokeWidth="1.5"/>

            <path d="M25,15 L28,22 L35,23 L30,27 L32,34 L25,30 L18,34 L20,27 L15,23 L22,22 Z" fill="#FBBF24" stroke="white" strokeWidth="1.5"/>
            <path d="M125,60 L127,65 L132,65 L128,68 L129,73 L125,70 L121,73 L122,68 L118,65 L123,65 Z" fill="#FBBF24" stroke="white" strokeWidth="1.5" transform="scale(0.7) translate(30,15)"/>
            
            <path d="M 120 15 L 125 25" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <path d="M 130 10 L 135 20" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />

            <text x="75" y="52" fontFamily="'Noto Sans KR', sans-serif" fontSize="20" fontWeight="bold" fill="#e11d48" textAnchor="middle">
                Click Me!
            </text>
        </svg>
    </div>
);

interface Winner {
    id: number;
    invalidated: boolean;
    redrawn?: boolean;
    fromRedraw?: boolean;
    replacesWinnerId?: number;
}

// --- Main App Component ---
const App: React.FC = () => {
    const [prizes, setPrizes] = useState(() => 
        INITIAL_PRIZES_CONFIG.map(p => ({ ...p, winners: [] as Winner[] }))
    );
    const [participantsCount, setParticipantsCount] = useState(150);
    
    const [isEditingPrizes, setIsEditingPrizes] = useState(false);
    const [tempPrizes, setTempPrizes] = useState(prizes);

    const [isEditingParticipants, setIsEditingParticipants] = useState(false);
    const [tempParticipantsCount, setTempParticipantsCount] = useState(String(participantsCount));

    const [selectedPrizeId, setSelectedPrizeId] = useState<number | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastDrawnWinners, setLastDrawnWinners] = useState<number[]>([]);
    const [lastActionPrizeId, setLastActionPrizeId] = useState<number | null>(null);
    const [isBearAnimating, setIsBearAnimating] = useState(false);

    const participants = useMemo(() => Array.from({ length: participantsCount }, (_, i) => i + 1), [participantsCount]);
    const allDrawnNumbers = useMemo(() => prizes.flatMap(p => p.winners.map(w => w.id)), [prizes]);
    const totalValidWinnersCount = useMemo(() => prizes.flatMap(p => p.winners).filter(w => !w.invalidated).length, [prizes]);
    const totalPrizeCount = useMemo(() => prizes.reduce((sum, p) => sum + p.total, 0), [prizes]);
    const winnersWithColor = useMemo(() => {
        return prizes.flatMap((prize, index) => {
            const colorClass = PRIZE_COLORS[index % PRIZE_COLORS.length];
            return prize.winners.map(winner => ({
                ...winner,
                color: colorClass,
                prizeId: prize.id,
            }));
        }).sort((a, b) => a.id - b.id);
    }, [prizes]);
    
    const handleBearClick = useCallback(() => {
        if (!isBearAnimating) {
            setIsBearAnimating(true);
            setTimeout(() => setIsBearAnimating(false), 700); // Animation duration
        }
    }, [isBearAnimating]);

    const handleDraw = useCallback((count: number) => {
        const selectedPrize = prizes.find(p => p.id === selectedPrizeId);
        if (isDrawing || !selectedPrize || selectedPrize.winners.some(w => w.invalidated && !w.redrawn) || selectedPrize.winners.filter(w => !w.invalidated).length >= selectedPrize.total || allDrawnNumbers.length >= participantsCount) {
            return;
        }

        setLastActionPrizeId(selectedPrizeId);
        setIsDrawing(true);
        setLastDrawnWinners([]);

        setTimeout(() => {
            const currentAllDrawn = prizes.flatMap(p => p.winners.map(w => w.id));
            const availableParticipants = participants.filter(p => !currentAllDrawn.includes(p));
            const shuffledParticipants = [...availableParticipants].sort(() => 0.5 - Math.random());
            
            const slotsToFill = selectedPrize.total - selectedPrize.winners.filter(w => !w.invalidated).length;
            const numToDraw = Math.min(count, slotsToFill, shuffledParticipants.length);

            const newWinners: number[] = [];
            for (let i = 0; i < numToDraw; i++) {
                const winner = shuffledParticipants.pop();
                if(winner) newWinners.push(winner);
            }

            if (newWinners.length > 0) {
                setPrizes(prevPrizes =>
                    prevPrizes.map(p =>
                        p.id === selectedPrizeId
                            ? { ...p, winners: [...p.winners, ...newWinners.map(w => ({id: w, invalidated: false}))].sort((a, b) => a.id - b.id) }
                            : p
                    )
                );
                setLastDrawnWinners(newWinners.sort((a, b) => a - b));
            }
            
            setIsDrawing(false);
        }, 1000);
    }, [isDrawing, selectedPrizeId, prizes, participants, allDrawnNumbers.length, participantsCount]);

    const handleRedraw = useCallback((prizeId: number) => {
        if (isDrawing) return;

        const prizeToRedraw = prizes.find(p => p.id === prizeId);
        if (!prizeToRedraw) return;
        
        const winnersToRedraw = prizeToRedraw.winners.filter(w => w.invalidated && !w.redrawn);
        if (winnersToRedraw.length === 0) return;

        const redrawCount = winnersToRedraw.length;

        setLastActionPrizeId(prizeId);
        setIsDrawing(true);
        setLastDrawnWinners([]);
        handleBearClick();

        setTimeout(() => {
            const currentAllDrawnIds = new Set(prizes.flatMap(p => p.winners.map(w => w.id)));
            const availableParticipants = participants.filter(p => !currentAllDrawnIds.has(p));
            
            if (availableParticipants.length < redrawCount) {
                alert('재추첨에 필요한 참가자 수가 부족합니다.');
                setIsDrawing(false);
                return;
            }

            const shuffledParticipants = [...availableParticipants].sort(() => 0.5 - Math.random());
            const newWinnerIds = shuffledParticipants.slice(0, redrawCount);
            const newWinnerObjects = newWinnerIds.map((id, index) => ({ 
                id, 
                invalidated: false, 
                fromRedraw: true,
                replacesWinnerId: winnersToRedraw[index].id,
            }));

            setPrizes(prevPrizes =>
                prevPrizes.map(p => {
                    if (p.id === prizeId) {
                        const updatedOldWinners = p.winners.map(w => 
                            (w.invalidated && !w.redrawn) ? { ...w, redrawn: true } : w
                        );
                        return {
                            ...p,
                            winners: [...updatedOldWinners, ...newWinnerObjects].sort((a, b) => a.id - b.id),
                        };
                    }
                    return p;
                })
            );
            
            setLastDrawnWinners(newWinnerIds.sort((a,b) => a-b));
            setIsDrawing(false);
        }, 1000);
    }, [isDrawing, prizes, participants, handleBearClick]);
    
    const handleToggleWinnerValidity = useCallback((prizeId: number, winnerId: number) => {
        if (isDrawing) return;
    
        setPrizes(currentPrizes => {
            return currentPrizes.map(p => {
                if (p.id !== prizeId) {
                    return p;
                }
    
                const winnerToToggle = p.winners.find(w => w.id === winnerId);
    
                if (!winnerToToggle) {
                    return p;
                }
    
                // A winner that was invalidated AND replaced via redraw cannot be re-validated.
                if (winnerToToggle.invalidated && winnerToToggle.redrawn) {
                    return p;
                }
    
                // For any other winner, toggle their 'invalidated' status.
                const updatedWinners = p.winners.map(w =>
                    w.id === winnerId ? { ...w, invalidated: !w.invalidated } : w
                );
                
                return { ...p, winners: updatedWinners };
            });
        });
    }, [isDrawing]);

    const handleTogglePrizeEdit = () => {
        if (isDrawing) return;
        if (isEditingPrizes) {
            const validatedPrizes = tempPrizes.map(p => ({...p, total: Number(p.total) || 0})).filter(p => p.name.trim() !== '');
            setPrizes(validatedPrizes);
            if (selectedPrizeId && !validatedPrizes.some(p => p.id === selectedPrizeId)) {
                setSelectedPrizeId(null);
            }
        } else {
            setTempPrizes(prizes);
        }
        setIsEditingPrizes(!isEditingPrizes);
    };

    const handleTempPrizeChange = (id: number, field: 'name' | 'total', value: string) => {
        setTempPrizes(current =>
            current.map(p => {
                if (p.id === id) {
                    if (field === 'total') {
                        return { ...p, total: Number(value) };
                    }
                    return { ...p, name: value };
                }
                return p;
            })
        );
    };
    
    const handleEnterParticipantsEdit = () => {
        if (isDrawing) return;
        setTempParticipantsCount(String(participantsCount));
        setIsEditingParticipants(true);
    };

    const handleSaveParticipants = () => {
        const newCount = parseInt(tempParticipantsCount, 10);
        if (!isNaN(newCount) && newCount > 0) {
            if (newCount < allDrawnNumbers.length) {
                alert('총 인원은 현재까지 추첨된 인원(무효 포함) 수보다 적을 수 없습니다.');
                setTempParticipantsCount(String(participantsCount));
                return;
            }
            setParticipantsCount(newCount);
        } else {
             setTempParticipantsCount(String(participantsCount));
        }
        setIsEditingParticipants(false);
    };
    
    const closeModal = () => setLastDrawnWinners([]);

    const currentPrizesForSelection = isEditingPrizes ? tempPrizes : prizes;
    const selectedPrizeForDraw = prizes.find(p => p.id === selectedPrizeId);
    const hasInvalidatedWinnersInSelected = selectedPrizeForDraw ? selectedPrizeForDraw.winners.some(w => w.invalidated && !w.redrawn) : false;
    const canDraw = selectedPrizeForDraw && !hasInvalidatedWinnersInSelected && selectedPrizeForDraw.winners.filter(w => !w.invalidated).length < selectedPrizeForDraw.total && allDrawnNumbers.length < participantsCount;

    const selectedPrizeIndex = useMemo(() => {
        if (!selectedPrizeId) return -1;
        return prizes.findIndex(p => p.id === selectedPrizeId);
    }, [selectedPrizeId, prizes]);
    
    const lastActionPrizeIndex = useMemo(() => {
        if (!lastActionPrizeId) return -1;
        return prizes.findIndex(p => p.id === lastActionPrizeId);
    }, [lastActionPrizeId, prizes]);
    
    const winnerModalColorClass = lastActionPrizeIndex !== -1 ? PRIZE_COLORS[lastActionPrizeIndex % PRIZE_COLORS.length] : 'bg-amber-300 text-amber-900';

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 text-gray-800 selection:bg-pink-300">
            <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-grow">
                {/* Left Column */}
                <div className="md:col-span-1 flex flex-col md:justify-center gap-4 lg:gap-6">
                    <div className="w-full p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 flex flex-col">
                        <div className="relative flex justify-center mb-6">
                            <h3 className="text-4xl font-bold text-gray-800 font-yeon-sung relative -left-4 lg:-left-5">
                                경 품 리 스 트
                            </h3>
                            <button onClick={handleTogglePrizeEdit} disabled={isDrawing} className={`absolute top-1/2 -translate-y-1/2 right-0 flex-shrink-0 text-sm font-bold py-1 px-4 rounded-lg transition-colors ${isEditingPrizes ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isEditingPrizes ? '저장' : '수정'}
                            </button>
                        </div>
                        <ul className="flex flex-col gap-2 overflow-y-auto pr-2">
                            {(isEditingPrizes ? tempPrizes : prizes).map((prize, index) => {
                                const prizeColorClass = PRIZE_COLORS[index % PRIZE_COLORS.length];
                                const validWinnerCount = prize.winners.filter(w => !w.invalidated).length;
                                const redrawableWinnerCount = prize.winners.filter(w => w.invalidated && !w.redrawn).length;
                                const remainingCount = Math.max(0, prize.total - validWinnerCount);
                                return (
                                   <li key={prize.id} className={`flex items-center gap-3 p-2 lg:p-3 rounded-lg bg-gray-100/60`}>
                                     <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${prizeColorClass}`}>
                                        {index + 1}
                                     </div>
                                     {isEditingPrizes ? (
                                        <>
                                            <input 
                                                type="text" 
                                                value={prize.name} 
                                                onChange={(e) => handleTempPrizeChange(prize.id, 'name', e.target.value)}
                                                className="text-lg font-bold text-gray-800 bg-white border border-gray-300 rounded p-1 w-full"
                                            />
                                            <input 
                                                type="number"
                                                value={prize.total}
                                                onChange={(e) => handleTempPrizeChange(prize.id, 'total', e.target.value)}
                                                className="text-base font-bold text-gray-600 bg-white border border-gray-300 rounded p-1 w-16 text-right"
                                            />
                                        </>
                                     ) : (
                                        <>
                                            <span className="flex-grow text-center text-2xl lg:text-3xl font-bold text-gray-800">{prize.name}</span>
                                            <div className="ml-auto flex items-center gap-2">
                                                {redrawableWinnerCount > 0 && (
                                                    <button
                                                        onClick={() => handleRedraw(prize.id)}
                                                        disabled={isDrawing}
                                                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                                        title={`${redrawableWinnerCount}명 재추첨`}
                                                    >
                                                        재추첨
                                                    </button>
                                                )}
                                                <div className={`flex items-center justify-center text-xl font-bold h-10 w-16 rounded-full shadow-sm ${prizeColorClass}`}>
                                                  {remainingCount}개
                                                </div>
                                            </div>
                                        </>
                                     )}
                                   </li>
                                );
                            })}
                        </ul>
                    </div>
                    
                    <div className="flex flex-col items-center w-full gap-4">
                         <div className={`relative w-80 h-72 -mt-12 flex items-center justify-center cursor-pointer ${isBearAnimating ? 'animate-jiggle' : ''}`} onClick={handleBearClick}>
                            <SpeechBubble />
                            <svg viewBox="0 0 200 180" className="w-full h-full" aria-label="선물 상자를 들고 있는 귀여운 곰 캐릭터">
                                <g transform="translate(100, 90)">
                                    <path d="M -60,60 C -60,20 60,20 60,60 C 60,100 -60,100 -60,60 Z" fill="#D2B48C"/>
                                    <g transform="translate(0, 10)">
                                        <circle cx="-45" cy="-40" r="15" fill="#A0522D"/><circle cx="45" cy="-40" r="15" fill="#A0522D"/>
                                        <circle cx="-45" cy="-40" r="10" fill="#D2B48C"/><circle cx="45" cy="-40" r="10" fill="#D2B48C"/>
                                        <circle cx="0" cy="-20" r="50" fill="#D2B48C"/>
                                        <ellipse cx="0" cy="5" rx="25" ry="22" fill="#F5DEB3"/>
                                        <circle cx="-30" cy="8" r="10" fill="#FFB6C1" opacity="0.8"/><circle cx="30" cy="8" r="10" fill="#FFB6C1" opacity="0.8"/>
                                        <circle cx="-18" cy="-15" r="4" fill="#4A3731"/><circle cx="18" cy="-15" r="4" fill="#4A3731"/>
                                        <path d="M-4,2 Q0,-2 4,2 Q0,6 -4,2 Z" fill="#4A3731" /><path d="M-7,7 C-3 12, 3 12, 7 7" stroke="#4A3731" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                    </g>
                                    <g transform="translate(0, 45)"><rect x="-40" y="0" width="80" height="50" rx="5" fill="#4682B4"/><rect x="-5" y="0" width="10" height="50" fill="#B0C4DE"/><path d="M -10, -5 C -20 -20, 0 -15, 0 -2 Z" fill="#B0C4DE"/><path d="M 10, -5 C 20 -20, 0 -15, 0 -2 Z" fill="#B0C4DE"/><rect x="-15" y="-2" width="30" height="4" rx="2" fill="#2F4F4F"/></g>
                                    <path d="M -55,50 C -75,55 -70,85 -50,85 L -42,85 C -32,85 -37,55 -42,50 Z" fill="#D2B48C" stroke="#A0522D" strokeWidth="2" strokeLinejoin="round"/><path d="M 55,50 C 75,55 70,85 50,85 L 42,85 C 32,85 37,55 42,50 Z" fill="#D2B48C" stroke="#A0522D" strokeWidth="2" strokeLinejoin="round"/>
                                </g>
                            </svg>
                            {isBearAnimating && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fly-heart z-10">
                                    <span role="img" aria-label="heart" className="text-5xl text-red-500" style={{ textShadow: '0 0 8px white' }}>❤️</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 flex flex-col flex-grow">
                             <div className="flex gap-4 h-full flex-grow">
                                <div className="w-1/2 flex flex-col gap-2">
                                    {currentPrizesForSelection.map(prize => {
                                        const validWinnerCount = prize.winners.filter(w => !w.invalidated).length;
                                        const remainingCount = Math.max(0, prize.total - validWinnerCount);
                                        return (
                                            <div key={prize.id} 
                                                 onClick={() => !isEditingPrizes && setSelectedPrizeId(prize.id)}
                                                 className={`relative w-full rounded-lg transition-all border p-3 text-center ${isEditingPrizes ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'} ${selectedPrizeId === prize.id && !isEditingPrizes ? 'bg-yellow-100 border-2 border-pink-400 shadow-inner' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                                                <p className="font-bold text-lg">{prize.name}</p>
                                                <p className="text-sm text-gray-600">({remainingCount}/{prize.total} 남음)</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <div className="flex-grow">
                                    {isEditingPrizes ? (
                                        <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center text-center text-gray-500 font-medium h-full p-4">
                                            수정 완료 후<br/>추첨 가능합니다
                                        </div>
                                    ) : selectedPrizeId ? (
                                        hasInvalidatedWinnersInSelected ? (
                                            <div className="w-full bg-orange-100 border border-orange-300 rounded-lg flex items-center justify-center text-center text-orange-700 font-bold text-lg h-full p-4 leading-relaxed break-keep">
                                                무효 처리된 당첨자가 있습니다.<br/>먼저 재추첨을 진행해주세요.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 h-full">
                                                {DRAW_OPTIONS.map(count => {
                                                    const drawButtonColor = selectedPrizeIndex !== -1 ? DRAW_BUTTON_COLORS[selectedPrizeIndex % DRAW_BUTTON_COLORS.length] : 'bg-gray-300';
                                                    return (
                                                         <button key={count} onClick={() => handleDraw(count)} disabled={!canDraw || isDrawing} className={`p-2 text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${drawButtonColor}`}>
                                                            {count}개 뽑기
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center text-center text-gray-500 font-medium h-full p-4">
                                            경품을 선택하세요
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 flex flex-col gap-4 lg:gap-6">
                    <header className="w-full flex flex-col items-center text-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/60">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800">
                            2025년 부산광역시 응급의료 유관기관 워크숍
                        </h1>
                        <p className="text-2xl md:text-3xl lg:text-4xl font-black text-pink-500 mt-2">
                            <span role="img" aria-label="선물 아이콘" className="mr-2">🎁</span>
                            경품 추첨
                            <span role="img" aria-label="선물 아이콘" className="ml-2">🎁</span>
                        </p>
                    </header>
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 flex flex-col flex-grow">
                        <div className="text-center mb-2 pb-3 border-b-2 border-pink-200">
                             <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 relative -left-3">🏆 당첨자 현황</h2>
                        </div>
                        <div className="flex justify-around items-center mb-4 p-2 flex-wrap gap-2">
                             <div className="p-4 rounded-lg bg-pink-100 text-center min-w-[130px] lg:min-w-[160px]">
                                 <div className="text-xl font-bold text-pink-800">당첨</div>
                                 <div className="text-3xl lg:text-4xl font-black text-pink-600">{totalValidWinnersCount} / {totalPrizeCount}</div>
                             </div>
                             <div className="p-4 rounded-lg bg-sky-100 text-center min-w-[130px] lg:min-w-[160px]">
                                 <div className="text-xl font-bold text-sky-800">남은 인원</div>
                                 <div className="text-3xl lg:text-4xl font-black text-sky-600">{participantsCount - allDrawnNumbers.length}</div>
                             </div>
                              <div className="p-4 rounded-lg bg-gray-100 text-center min-w-[130px] lg:min-w-[160px]">
                                 <div className="text-xl font-bold text-gray-800">총 인원</div>
                                 {isEditingParticipants ? (
                                    <input
                                        type="number"
                                        value={tempParticipantsCount}
                                        onChange={(e) => setTempParticipantsCount(e.target.value)}
                                        onBlur={handleSaveParticipants}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveParticipants() }}
                                        autoFocus
                                        className="text-3xl lg:text-4xl font-black text-gray-600 bg-white border border-gray-300 rounded-lg w-28 text-center mt-1"
                                    />
                                 ) : (
                                    <div onClick={handleEnterParticipantsEdit} className="text-3xl lg:text-4xl font-black text-gray-600 mt-1 cursor-pointer">{participantsCount}</div>
                                 )}
                             </div>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                             {winnersWithColor.length > 0 ? (
                                (() => {
                                    const validWinners = winnersWithColor.filter(w => !w.invalidated);
                                    const invalidatedWinners = winnersWithColor.filter(w => w.invalidated);
                        
                                    return (
                                        <>
                                            {/* Valid Winners Grid */}
                                            {validWinners.length > 0 ? (
                                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                                                    {validWinners.map(({id, color, prizeId, fromRedraw}) => (
                                                        <button 
                                                            key={id} 
                                                            onClick={() => handleToggleWinnerValidity(prizeId, id)}
                                                            disabled={isDrawing}
                                                            className={`relative flex flex-col items-center justify-center text-3xl lg:text-4xl font-bold h-16 lg:h-20 rounded-full shadow-sm transition-all ${color} hover:scale-105 active:scale-95`}
                                                            aria-label={`Winner ${id}, prize ${prizeId}. Click to invalidate.`}
                                                        >
                                                            {fromRedraw && <span className="text-xs font-black leading-none -mb-1 text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)' }}>재추첨</span>}
                                                            <span>{id}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="col-span-full flex items-center justify-center h-24">
                                                    <p className="text-xl lg:text-2xl text-gray-500">모든 당첨자가 무효 처리되었습니다.</p>
                                                </div>
                                            )}
                        
                                            {/* Invalidated Winners Section */}
                                            {invalidatedWinners.length > 0 && (
                                                <>
                                                    <div className="text-center my-4">
                                                        <h3 className="inline-block bg-rose-100 text-rose-600 text-2xl font-bold font-yeon-sung py-2 px-8 rounded-full shadow border border-rose-200">
                                                            <span role="img" aria-label="down arrow" className="mr-2">👇</span>
                                                            무효 번호
                                                            <span role="img" aria-label="down arrow" className="ml-2">👇</span>
                                                        </h3>
                                                    </div>
                                                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                                                        {invalidatedWinners.map(({id, prizeId, redrawn, fromRedraw, invalidated}) => (
                                                            <button 
                                                                key={id} 
                                                                onClick={() => handleToggleWinnerValidity(prizeId, id)}
                                                                disabled={isDrawing || (invalidated && redrawn)}
                                                                className={`relative flex flex-col items-center justify-center text-3xl lg:text-4xl font-bold h-16 lg:h-20 rounded-full shadow-sm transition-all bg-gray-300 text-gray-600 ${!(invalidated && redrawn) ? 'hover:bg-gray-400' : ''} disabled:cursor-not-allowed disabled:opacity-70`}
                                                                aria-label={`Invalidated Winner ${id}, prize ${prizeId}. Click to re-validate.`}
                                                            >
                                                                {fromRedraw && <span className="text-xs font-black leading-none -mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>재추첨</span>}
                                                                <span className={redrawn ? 'line-through' : ''}>{id}</span>
                                                                {redrawn && <span className="absolute text-xs bottom-2 font-bold text-red-600">교체됨</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )
                                })()
                             ) : (
                                <div className="col-span-full flex items-center justify-center h-full">
                                    <p className="text-xl lg:text-2xl text-gray-500">아직 당첨자가 없습니다.</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Winner Announcement Modal */}
            {lastDrawnWinners.length > 0 && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-in fade-in-0 zoom-in-90 duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <Confetti />
                        <h2 className="text-4xl text-center font-black text-pink-500 mb-6 z-10 relative">🎉 축하합니다! 🎉</h2>
                        
                        {lastDrawnWinners.length === 1 ? (
                            <div className="flex items-center justify-center z-10 relative">
                                <div className={`font-black text-8xl w-48 h-48 flex items-center justify-center rounded-full shadow-lg ${winnerModalColorClass}`}>
                                    {lastDrawnWinners[0]}
                                </div>
                            </div>
                        ) : (
                            <div className="z-10 relative">
                                <h3 className="text-2xl text-center font-bold mb-4 text-gray-700">{lastDrawnWinners.length}명 당첨!</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-100 rounded-lg">
                                    {lastDrawnWinners.map(winner => (
                                        <div key={winner} className={`flex items-center justify-center text-xl font-bold h-12 rounded-lg shadow-sm ${winnerModalColorClass}`}>
                                            {winner}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                         <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;