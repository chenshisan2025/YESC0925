/**
 * 全局错误处理器
 * Global Error Handler for API and Application Errors
 */

import { toast } from 'react-hot-toast';
import { config } from './config';

// 错误类型定义
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// 错误接口定义
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: number;
  retryable: boolean;
  retryCount?: number;
}

// 错误统计
interface ErrorStats {
  total: number;
  byType: Record<ErrorType, number>;
  bySeverity: Record<ErrorSeverity, number>;
  lastError?: AppError;
}

class ErrorHandler {
  private errorStats: ErrorStats = {
    total: 0,
    byType: Object.values(ErrorType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<ErrorType, number>),
    bySeverity: Object.values(ErrorSeverity).reduce((acc, severity) => ({ ...acc, [severity]: 0 }), {} as Record<ErrorSeverity, number>),
  };

  private errorListeners: Array<(error: AppError) => void> = [];

  // 创建标准化错误
  createError(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    const error: AppError = {
      type,
      severity,
      message,
      originalError,
      context,
      timestamp: Date.now(),
      retryable: this.isRetryable(type),
      retryCount: 0,
    };

    this.recordError(error);
    return error;
  }

  // 处理错误
  handleError(error: AppError | Error, showToast: boolean = true): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = this.parseError(error);
    } else {
      appError = error;
    }

    this.recordError(appError);
    this.notifyListeners(appError);

    if (showToast) {
      this.showErrorToast(appError);
    }

    if (config.dev.debugApi) {
      console.group(`🚨 Error [${appError.type}]`);
      console.error('Message:', appError.message);
      console.error('Severity:', appError.severity);
      console.error('Context:', appError.context);
      if (appError.originalError) {
        console.error('Original Error:', appError.originalError);
      }
      console.groupEnd();
    }

    return appError;
  }

  // 解析原生错误
  private parseError(error: Error): AppError {
    let type = ErrorType.UNKNOWN_ERROR;
    let severity = ErrorSeverity.MEDIUM;
    let message = error.message;

    // 网络错误
    if (error.name === 'NetworkError' || message.includes('fetch')) {
      type = ErrorType.NETWORK_ERROR;
      message = '网络连接失败，请检查网络设置';
    }
    // 超时错误
    else if (message.includes('timeout') || message.includes('aborted')) {
      type = ErrorType.TIMEOUT_ERROR;
      message = '请求超时，请稍后重试';
    }
    // API错误
    else if (message.includes('API') || message.includes('HTTP')) {
      type = ErrorType.API_ERROR;
      
      // 检查是否是限流错误
      if (message.includes('429') || message.includes('rate limit')) {
        type = ErrorType.RATE_LIMIT_ERROR;
        message = 'API调用频率过高，请稍后重试';
        severity = ErrorSeverity.HIGH;
      }
    }
    // 验证错误
    else if (message.includes('validation') || message.includes('invalid')) {
      type = ErrorType.VALIDATION_ERROR;
      severity = ErrorSeverity.LOW;
    }

    return this.createError(type, message, severity, error);
  }

  // 判断错误是否可重试
  private isRetryable(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.RATE_LIMIT_ERROR,
    ];
    return retryableTypes.includes(type);
  }

  // 记录错误统计
  private recordError(error: AppError): void {
    this.errorStats.total++;
    this.errorStats.byType[error.type]++;
    this.errorStats.bySeverity[error.severity]++;
    this.errorStats.lastError = error;
  }

  // 显示错误提示
  private showErrorToast(error: AppError): void {
    const toastOptions = {
      duration: this.getToastDuration(error.severity),
      position: 'top-right' as const,
    };

    switch (error.severity) {
      case ErrorSeverity.LOW:
        toast(error.message, { ...toastOptions, icon: '⚠️' });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(error.message, toastOptions);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(error.message, { ...toastOptions, duration: 6000 });
        break;
    }
  }

  // 获取提示持续时间
  private getToastDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 3000;
      case ErrorSeverity.MEDIUM:
        return 4000;
      case ErrorSeverity.HIGH:
        return 5000;
      case ErrorSeverity.CRITICAL:
        return 8000;
      default:
        return 4000;
    }
  }

  // 添加错误监听器
  addErrorListener(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  // 通知监听器
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  // 获取错误统计
  getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }

  // 清除错误统计
  clearErrorStats(): void {
    this.errorStats = {
      total: 0,
      byType: Object.values(ErrorType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<ErrorType, number>),
      bySeverity: Object.values(ErrorSeverity).reduce((acc, severity) => ({ ...acc, [severity]: 0 }), {} as Record<ErrorSeverity, number>),
    };
  }

  // 重试逻辑
  async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = config.bscscan.retryAttempts,
    delay: number = config.bscscan.retryDelay,
    backoff: boolean = true
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const appError = this.handleError(lastError, false);
        appError.retryCount = attempt;

        if (attempt === maxAttempts || !appError.retryable) {
          throw appError;
        }

        // 计算延迟时间（指数退避）
        const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        
        if (config.dev.debugApi) {
          console.log(`🔄 Retrying operation (${attempt}/${maxAttempts}) after ${currentDelay}ms`);
        }

        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }

    throw lastError!;
  }
}

// 导出单例实例
export const errorHandler = new ErrorHandler();

// 便捷函数
export const handleError = (error: AppError | Error, showToast?: boolean) => 
  errorHandler.handleError(error, showToast);

export const createError = (
  type: ErrorType,
  message: string,
  severity?: ErrorSeverity,
  originalError?: Error,
  context?: Record<string, any>
) => errorHandler.createError(type, message, severity, originalError, context);

export const retry = <T>(
  operation: () => Promise<T>,
  maxAttempts?: number,
  delay?: number,
  backoff?: boolean
) => errorHandler.retry(operation, maxAttempts, delay, backoff);

export default errorHandler;