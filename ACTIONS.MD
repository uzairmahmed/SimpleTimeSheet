# Server Action Patterns

## Standard Response Shape
All Server Actions should return a consistent object:
```typescript
{
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>; // For Zod validation errors
}