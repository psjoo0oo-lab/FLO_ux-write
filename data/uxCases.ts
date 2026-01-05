export interface UXCaseStudy {
    id: string;
    title: string;
    goal: string;
    examples: {
        context: string;
        output: string;
        toneLevel: string;
    }[];
    logic: string[];
}

export const UX_CASES: UXCaseStudy[] = [
    {
        id: 'case_playlist_clean',
        title: '재생목록 정리 기능',
        goal: '재생목록 정리 기능을 한 번이라도 써보게 만드는 진입 트리거 및 의미 있는 넛지 설계',
        examples: [
            { context: '첫 진입', output: '"재생목록 청소 기능이 생겼어요!"', toneLevel: 'Lv.5' },
            { context: '재생목록 곡 2,900곡 초과', output: '"재생목록이 97% 찼어요. 청소할까요?"', toneLevel: 'Lv.4' },
            { context: '재생목록에 담은 후 한 번도 재생하지 않은 곡 100곡 이상', output: '"한 번도 안 들은 곡, 청소할까요?"', toneLevel: 'Lv.4' },
            { context: '오늘을 포함하여 30일동안 안 들은 곡 100곡 이상', output: '"한 달 동안 안 들은 곡, 청소할까요?"', toneLevel: 'Lv.4' },
            { context: '마지막 편집 완료일로부터 30일 초과 (31일 째)', output: '"정리한 지 한 달이 지났어요."', toneLevel: 'Lv.3' }
        ],
        logic: [
            "명분(Data) 제시: '97%', '한 달' 등 구체적 수치로 사용자가 행동해야 할 객관적 근거를 만든다.",
            "비유적 전환: '삭제/관리' 대신 '청소'라는 일상적 단어를 써서 심리적 무게를 줄인다.",
            "청유형 활용: 명령조가 아닌 '~할까요?'를 사용하여 사용자의 선택권을 존중한다."
        ]
    },
    {
        id: 'case_quick_selection',
        title: '빠른 선곡 기능',
        goal: '빠른 선곡을 사용해보지 않은 고객이, 빠른 선곡의 기능을 이해할 수 있도록 한다',
        examples: [
            { context: '', output: '"첫 곡만 고르면 끊임없이 재생해요"', toneLevel: 'Lv.5' },
            { context: '', output: '"재생목록에 남지 않으니 부담 없이 계속 들어보세요"', toneLevel: 'Lv.4' },
            { context: '', output: '"재생목록에 담지 않고 들어보세요"', toneLevel: 'Lv.3' },
            { context: '', output: '"지금 재생 중인 음악은 그대로 유지돼요"', toneLevel: 'Lv.3' },
            { context: '', output: '"사용 중인 재생목록은 그대로 두고 빠른 선곡을 이용할 수 있어요"', toneLevel: 'Lv.3' },
            { context: '', output: '"재생목록 변경 없이 이용할 수 있어요"', toneLevel: 'Lv.2' },
            { context: '', output: '"내 재생목록은 바뀌지 않아요"', toneLevel: 'Lv.2' }
        ],
        logic: [
            "불안 선제 대응: 사용자가 기능을 쓰기 전 가장 걱정하는 지점(목록 변경 등)을 먼저 언급하여 안심시킨다.",
            "결과적 혜택 소구: 기능 설명보다 '끊임없이 재생'과 같이 사용자가 얻을 최종 혜택을 먼저 말한다.",
            "부담감 감소: '남지 않으니', '담지 않아도' 등의 표현으로 심리적 비용이 없음을 강조한다."
        ]
    }
];
