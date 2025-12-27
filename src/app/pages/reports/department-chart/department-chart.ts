import { Component, Input } from '@angular/core';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'department-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './department-chart.html',
  styleUrl: './department-chart.css'
})
export class DepartmentChart {
  @Input() data: { name: string, employeeCount: number }[] = [];

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Empleados' }]
  };

  ngOnChanges() {
    this.chartData.labels = this.data.map(d => d.name);
    this.chartData.datasets[0].data = this.data.map(d => d.employeeCount);
  }
}
