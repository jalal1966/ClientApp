import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../services/usersService/users.service';
import { User } from '../../../../models/user';
import { FormsModule } from '@angular/forms';
import { pipe } from 'rxjs';
import { JobTitlePipe } from '../../../../pipes/jopTitle/job-title.pipe';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, JobTitlePipe],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUserRole: string = 'All';

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    switch (this.selectedUserRole) {
      case 'Doctors':
        this.usersService
          .getDoctors()
          .subscribe((users) => (this.users = users));
        break;
      case 'Nurses':
        this.usersService
          .getNurses()
          .subscribe((users) => (this.users = users));
        break;
      case 'Management':
        this.usersService
          .getManagement()
          .subscribe((users) => (this.users = users));
        break;
      case 'Admin':
        this.usersService
          .getAdministrator()
          .subscribe((users) => (this.users = users));
        break;
      default:
        this.usersService.getUsers().subscribe((users) => (this.users = users));
        console.log('Users', this.users);
    }
  }

  deleteUser(userId: number): void {
    this.usersService.deleteUser(userId).subscribe(() => {
      this.loadUsers();
    });
  }
}
