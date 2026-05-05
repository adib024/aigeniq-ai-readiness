// lib/engine/benchmark.ts
import { createClient } from '@supabase/supabase-js';
import { Sector } from '../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface BenchmarkData {
    averageScore: number;
    count: number;
    percentile: number;
}

/**
 * Fetch live benchmarking data from Supabase for a specific sector
 */
export async function getLiveBenchmark(sector: Sector, currentScore: number): Promise<BenchmarkData> {
    try {
        const { data, error, count } = await supabase
            .from('assessments')
            .select('final_score', { count: 'exact' })
            .eq('sector', sector);

        if (error || !data || data.length === 0) {
            // Return expert-baseline defaults if no data exists yet
            return { averageScore: 35, count: 0, percentile: 50 };
        }

        const scores = data.map(d => parseFloat(d.final_score));
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Calculate simple percentile
        const belowCount = scores.filter(s => s < currentScore).length;
        const percentile = scores.length > 0 ? (belowCount / scores.length) * 100 : 50;

        return {
            averageScore: Math.round(avg),
            count: count || 0,
            percentile: Math.round(percentile)
        };
    } catch {
        return { averageScore: 35, count: 0, percentile: 50 };
    }
}
