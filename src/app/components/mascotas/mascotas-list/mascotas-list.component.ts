import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MascotasService } from '../../../services/mascotas.service';
import { Mascota } from '../../../models/Mascota.model';
import { MascotasResumeComponent } from '../mascotas-resume/mascotas-resume.component';

@Component({
  selector: 'app-mascotas-list',
  standalone: true,
  imports: [CommonModule, MascotasResumeComponent],
  templateUrl: './mascotas-list.component.html',
  styleUrls: ['./mascotas-list.component.css']
})
export class MascotasListComponent implements OnInit {
  mascotas: Mascota[] = [];

  constructor(private mascotasService: MascotasService) {}

  ngOnInit(): void {
    this.mascotasService.getMascotas().subscribe(data => {
      this.mascotas = data;
    });
  }
}
