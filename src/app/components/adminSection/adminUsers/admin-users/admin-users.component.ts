// admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { JopTitleID, User } from '../../../../models/user';
import { AuthService } from '../../../../services/auth/auth.service';
import { UsersService } from '../../../../services/usersService/users.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatSnackBarModule,
    UserDialogComponent,
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  displayedColumns: string[] = [
    'userID',
    'firstName',
    'lastName',
    'email',
    'username',
    'jobTitle',
    'actions',
  ];
  isLoading = true;
  searchForm: FormGroup;
  jobTitles = Object.entries(JopTitleID)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ name: key, id: value }));

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      jobTitleId: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    this.searchForm.valueChanges.subscribe((values) => {
      this.applyFilters(values);
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    // Assuming a method exists or needs to be created to get all users
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  applyFilters(filterValues: any): void {
    let filtered = [...this.users];

    if (filterValues.name) {
      const searchTerm = filterValues.name.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm)
      );
    }

    if (filterValues.jobTitleID !== '') {
      filtered = filtered.filter(
        (user) => user.jobTitleID === +filterValues.jobTitleId
      );
    }

    this.filteredUsers = filtered;
  }

  resetFilters(): void {
    this.searchForm.reset({
      name: '',
      jobTitleId: '',
    });
    this.filteredUsers = [...this.users];
  }

  // TODO

  /*addUser(user: User): void {
  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { user: user ? { ...user } : null, jobTitles: this.jobTitles },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'add') {
          this.addUser(result.user);
        } else if (result.action === 'edit') {
          this.updateUser(result.user);
        }
      }
    });
  }


    this.authService.addUser(user).subscribe({
      next: (newUser) => {
        this.users.push(newUser);
        this.filteredUsers = [...this.users];
        this.snackBar.open('User added successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.snackBar.open('Failed to add user', 'Close', { duration: 3000 });
      },
    });
  }

  updateUser(user: User): void {
    this.authService.updateUser(user).subscribe({
      next: () => {
        const index = this.users.findIndex((u) => u.userID === user.userID);
        if (index !== -1) {
          this.users[index] = user;
          this.filteredUsers = [...this.users];
        }
        this.snackBar.open('User updated successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.snackBar.open('Failed to update user', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.userID !== userId);
          this.filteredUsers = this.filteredUsers.filter(
            (u) => u.userID !== userId
          );
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }*/

  getJobTitleName(jobTitleID: number): string {
    const jobTitle = this.jobTitles.find((job) => job.id === jobTitleID);
    return jobTitle ? jobTitle.name : 'Unknown';
  }
}
