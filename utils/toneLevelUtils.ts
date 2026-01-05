import { WritingContext, ToneLevel } from '../types';

/**
 * 카테고리별 허용 톤 레벨 범위
 */
export const TONE_LEVEL_RANGES: Record<WritingContext, { min: ToneLevel; max: ToneLevel; recommended: ToneLevel }> = {
    [WritingContext.PRODUCT_UI]: {
        min: ToneLevel.NEUTRAL,      // Lv.2
        max: ToneLevel.EXPRESSIVE,     // Lv.5
        recommended: ToneLevel.FRIENDLY // Lv.3
    },
    [WritingContext.MARKETING]: {
        min: ToneLevel.FRIENDLY,      // Lv.3
        max: ToneLevel.EXPRESSIVE,    // Lv.5
        recommended: ToneLevel.EMOTIONAL // Lv.4
    },
    [WritingContext.CREATIVE]: {
        min: ToneLevel.FRIENDLY,      // Lv.3
        max: ToneLevel.EXPRESSIVE,    // Lv.5
        recommended: ToneLevel.EXPRESSIVE // Lv.5
    },
    [WritingContext.BUSINESS]: {
        min: ToneLevel.DRY,           // Lv.1
        max: ToneLevel.FRIENDLY,      // Lv.3
        recommended: ToneLevel.NEUTRAL // Lv.2
    }
};

/**
 * 주어진 카테고리에서 톤 레벨이 허용되는지 확인
 */
export function isToneLevelAllowed(context: WritingContext, tone: ToneLevel): boolean {
    const range = TONE_LEVEL_RANGES[context];
    return tone >= range.min && tone <= range.max;
}

/**
 * 주어진 카테고리의 추천 톤 레벨 반환
 */
export function getRecommendedToneLevel(context: WritingContext): ToneLevel {
    return TONE_LEVEL_RANGES[context].recommended;
}

/**
 * 주어진 카테고리의 톤 레벨 범위 반환
 */
export function getToneLevelRange(context: WritingContext): { min: ToneLevel; max: ToneLevel } {
    const range = TONE_LEVEL_RANGES[context];
    return { min: range.min, max: range.max };
}

/**
 * 톤 레벨이 범위를 벗어나면 가장 가까운 허용 레벨로 조정
 */
export function adjustToneLevel(context: WritingContext, tone: ToneLevel): ToneLevel {
    const range = TONE_LEVEL_RANGES[context];
    if (tone < range.min) return range.min;
    if (tone > range.max) return range.max;
    return tone;
}
