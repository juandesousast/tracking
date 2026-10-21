'use client';

import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  CandlestickData,
  HistogramData,
  Time,
  ColorType,
  CrosshairMode,
  LineStyle,
} from 'lightweight-charts';
import { Candle } from '@/lib/services/simulator-engine';
import { BacktestingPosition } from '@/types/database';

interface LightweightChartViewProps {
  candles: Candle[];
  visibleCount: number;
  openPositions?: BacktestingPosition[];
  symbol: string;
  decimals?: number;
}

export function LightweightChartView({
  candles,
  visibleCount,
  openPositions = [],
  symbol,
  decimals = 2,
}: LightweightChartViewProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const priceLinesRef = useRef<any[]>([]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      const isDark = document.documentElement.classList.contains('dark');

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: isDark ? '#090d16' : '#ffffff' },
          textColor: isDark ? '#94a3b8' : '#475569',
        },
        grid: {
          vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
          horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: isDark ? '#334155' : '#e2e8f0',
          scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
        },
        timeScale: {
          borderColor: isDark ? '#334155' : '#e2e8f0',
          timeVisible: true,
          secondsVisible: false,
        },
        width: chartContainerRef.current.clientWidth || 800,
        height: 480,
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
        priceFormat: {
          type: 'price',
          precision: decimals,
          minMove: Math.pow(10, -decimals),
        },
      });

      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#64748b',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // overlay
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
        volumeSeriesRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize LightweightChart:', err);
    }
  }, [decimals]);

  // Update visible candles data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    try {
      const visibleCandles = candles.slice(0, Math.min(visibleCount, candles.length));

      const candleData: CandlestickData<Time>[] = visibleCandles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const volumeData: HistogramData<Time>[] = visibleCandles.map((c) => ({
        time: c.time as Time,
        value: c.volume || 100,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
      }));

      candleSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);

      // Maintain recent focus
      if (chartRef.current && candleData.length > 0) {
        chartRef.current.timeScale().scrollToPosition(3, false);
      }
    } catch (err) {
      console.warn('Error setting candle data:', err);
    }
  }, [candles, visibleCount]);

  // Update open position price lines (Entry, SL, TP)
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    // Clear previous lines
    priceLinesRef.current.forEach((line) => {
      try {
        candleSeriesRef.current?.removePriceLine(line);
      } catch (e) {
        // Ignored
      }
    });
    priceLinesRef.current = [];

    // Add lines for current open positions
    openPositions.forEach((pos) => {
      try {
        // Entry line
        const entryLine = candleSeriesRef.current?.createPriceLine({
          price: pos.entry_price,
          color: pos.side === 'BUY' ? '#3b82f6' : '#f59e0b',
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: `${pos.side} @ ${pos.entry_price}`,
        });
        if (entryLine) priceLinesRef.current.push(entryLine);

        // Stop Loss line
        if (pos.stop_loss) {
          const slLine = candleSeriesRef.current?.createPriceLine({
            price: pos.stop_loss,
            color: '#ef4444',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `SL @ ${pos.stop_loss}`,
          });
          if (slLine) priceLinesRef.current.push(slLine);
        }

        // Take Profit line
        if (pos.take_profit) {
          const tpLine = candleSeriesRef.current?.createPriceLine({
            price: pos.take_profit,
            color: '#10b981',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `TP @ ${pos.take_profit}`,
          });
          if (tpLine) priceLinesRef.current.push(tpLine);
        }
      } catch (e) {
        console.warn('Error creating price line:', e);
      }
    });
  }, [openPositions]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {symbol}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
            1H Replay
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            En vivo
          </span>
          <span>Velas: {Math.min(visibleCount, candles.length)} / {candles.length}</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[480px]" />
    </div>
  );
}
