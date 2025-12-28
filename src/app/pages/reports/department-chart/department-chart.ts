import { Component, Input, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DepartmentStatsService } from '../../services/department-stats.service';

@Component({
  selector: 'department-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './department-chart.html',
  styleUrl: './department-chart.css'
})
export class DepartmentChart implements OnInit  {
  @Input() data: { name: string; employeeCount: number }[] = [];

  private readonly COLORS: string[] = [
    '#0b4ed0', '#146634', '#cc9a00', '#b02a2a', '#5a2a96', '#1a7d63',
    '#59104f', '#d6630b', '#0aa3b8', '#3d2f00', '#0072b2', '#1e3d2f',
    '#a87500', '#8b1f1f', '#4b1b6f', '#167a50', '#3f0d3a', '#b2581b',
    '#07838b', '#332600', '#00549f', '#144127', '#9c7000', '#701414',
    '#3d1a53', '#0f6047', '#50142a', '#994d21', '#02666d', '#1c1c1c'
  ];



  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: this.COLORS
      }
    ]
  };

  chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left'
      }
    }
  };

  constructor(private departmentStatsService: DepartmentStatsService) {}


  ngOnInit(): void {
    this.departmentStatsService.chartData$.subscribe(data => {
      if (!data.length) return;

      this.chartData.labels = data.map(d => d.name);
      this.chartData.datasets[0].data = data.map(d => d.employeeCount);
    });
  }
}
