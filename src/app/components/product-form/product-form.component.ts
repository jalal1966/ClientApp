import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId?: number;
  loading = false;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.productId = Number(idParam);
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.submitting = true;
      const product = this.productForm.value as Partial<Product>;

      if (this.isEditMode && this.productId) {
        this.productService
          .updateProduct(this.productId, {
            ...product,
            id: this.productId,
          } as Product)
          .subscribe({
            next: () => {
              this.router.navigate(['/products']);
            },
            error: (err) => {
              this.error = 'Failed to update product';
              this.submitting = false;
              console.error(err);
            },
          });
      } else {
        this.productService.createProduct(product as Product).subscribe({
          next: () => {
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.error = 'Failed to create product';
            this.submitting = false;
            console.error(err);
          },
        });
      }
    } else {
      this.productForm.markAllAsTouched();
    }
  }
}
