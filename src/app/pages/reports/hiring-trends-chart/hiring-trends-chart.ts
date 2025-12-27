import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

interface HiringTrend {
  date: string; // 'YYYY-MM-DD'
  newHires: number;
}

@Component({
  selector: 'hiring-trends-chart',
  imports: [BaseChartDirective],
  standalone: true,
  templateUrl: './hiring-trends-chart.html',
  styleUrl: './hiring-trends-chart.css'
})
export class HiringTrendsChart {
@Input() trends: HiringTrend[] = [];

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Nuevas Contrataciones',
        fill: true,
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.2)',
        tension: 0.3
      }
    ]
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Contrataciones'
        },
        beginAtZero: true
      }
    }
  };

  ngOnChanges() {
    this.chartData.labels = this.trends.map(t => t.date);
    this.chartData.datasets[0].data = this.trends.map(t => t.newHires);
  }
}
