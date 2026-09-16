/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComplexNumber } from '../types';

export class Complex {
  readonly re: number;
  readonly im: number;

  constructor(re: number = 0, im: number = 0) {
    this.re = Math.abs(re) < 1e-12 ? 0 : re;
    this.im = Math.abs(im) < 1e-12 ? 0 : im;
  }

  static zero(): Complex {
    return new Complex(0, 0);
  }

  static one(): Complex {
    return new Complex(1, 0);
  }

  static i(): Complex {
    return new Complex(0, 1);
  }

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  add(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re + other, this.im);
    }
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re - other, this.im);
    }
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re * other, this.im * other);
    }
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  div(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re / other, this.im / other);
    }
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) {
      throw new Error('Division by zero complex number');
    }
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  magSq(): number {
    return this.re * this.re + this.im * this.im;
  }

  mag(): number {
    return Math.sqrt(this.magSq());
  }

  phase(): number {
    return Math.atan2(this.im, this.re);
  }

  toString(precision: number = 3): string {
    const r = Number(this.re.toFixed(precision));
    const i = Number(this.im.toFixed(precision));

    if (i === 0) return `${r}`;
    if (r === 0) {
      if (i === 1) return 'i';
      if (i === -1) return '-i';
      return `${i}i`;
    }
    const sign = i > 0 ? '+' : '-';
    const absI = Math.abs(i);
    const iPart = absI === 1 ? 'i' : `${absI}i`;
    return `${r} ${sign} ${iPart}`;
  }
}
