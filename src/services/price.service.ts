import { Injectable } from '@nestjs/common';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

// Define la estructura de un activo financiero
interface Asset {
  name: string; // Nombre del activo
  mu: number; // Promedio de cambio (drift)
  sigma: number; // Volatilidad (desviacion estandar)
  s0: number; // Precio inicial
  spread: number; // Diferencia entre oferta y demanda
  lastPrice: number; // Ultimo precio calculado
}

@Injectable()
export class PriceService {
  // Array de activos financieros con sus propiedades
  private assets: Asset[] = [
    { name: 'WTI', mu: 0.06, sigma: 0.47, s0: 70.0, spread: 0.1, lastPrice: 70.0 },
    { name: 'SOY', mu: 0.08, sigma: 0.14, s0: 995.0, spread: 0.25, lastPrice: 995.0 },
    { name: 'YPF', mu: 0.16, sigma: 0.46, s0: 25.0, spread: 0.5, lastPrice: 25.0 },
    { name: 'SP500', mu: 0.1, sigma: 0.12, s0: 5700, spread: 5, lastPrice: 5700 },
  ];

  private dt = 1 / 252; // Intervalo de tiempo para calculos (1 dia laboral)
  private priceUpdates$ = new Subject<void>(); // Sujeto para controlar la emision de precios

  // Inicia la emision de precios de cada activo a intervalos regulares
  startEmittingPrices(callback: (data: any) => void) {
    interval(200).pipe(takeUntil(this.priceUpdates$)).subscribe(() => {
      // Recorre cada activo y calcula el nuevo precio
      this.assets.forEach((asset) => {
        const Si = this.calculatePrice(asset); // Calcula el nuevo precio del activo
        const bid = Si - asset.spread; // Calcula el precio de oferta (bid)
        const ask = Si + asset.spread; // Calcula el precio de demanda (ask)
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS'); // Genera la marca de tiempo actual
        
        // Llama al callback con los datos calculados
        callback({
          asset: asset.name,
          bid,
          ask,
          last: Si,
          timestamp,
        });

        asset.lastPrice = Si; // Actualiza el ultimo precio para el siguiente calculo
      });
    });
  }

  // Detiene la emision de precios
  stopEmittingPrices() {
    this.priceUpdates$.next();
  }

  // Calcula el nuevo precio de un activo basado en sus propiedades y una simulacion
  private calculatePrice(asset: Asset): number {
    const { mu, sigma, lastPrice } = asset;
    const randomNormal = Math.random(); // Genera un numero aleatorio normal
    return Number(
      (lastPrice * (1 + mu * this.dt + sigma * Math.sqrt(this.dt) * randomNormal)).toFixed(
        this.getDecimalPlaces(asset.spread),
      ),
    );
  }

  // Obtiene la cantidad de decimales basados en el spread del activo
  private getDecimalPlaces(spread: number): number {
    return spread.toString().split('.')[1]?.length || 0;
  }
}
