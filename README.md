# MyMosque

A React Native app for managing mosque events, prayers, and announcements.

## 🏗️ Architecture

This project follows a modular, component-based architecture designed for maintainability and open-source collaboration.

### Directory Structure

```
MyMosque/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab-based navigation
│   ├── components/               # App-specific components
│   │   └── events/              # Events page components
│   │       ├── WeekNavigator.tsx
│   │       ├── WeekCalendar.tsx
│   │       ├── EventsList.tsx
│   │       └── README.md
│   └── ...
├── components/                   # Shared components
├── lib/                         # Utilities and business logic
│   ├── constants.ts             # App-wide constants
│   ├── hooks/                   # Custom React hooks
│   ├── types.ts                 # TypeScript type definitions
│   └── ...
└── ...
```

## 🎯 Design Principles

### 1. **Component Composition**
- Break down large components into smaller, focused ones
- Each component has a single responsibility
- Components are reusable and testable

### 2. **Custom Hooks**
- Extract business logic from components
- Make state management reusable
- Improve testability and separation of concerns

### 3. **Constants Management**
- Centralize magic numbers and configuration
- Use typed constants for better maintainability
- Group related constants together

### 4. **Type Safety**
- Comprehensive TypeScript interfaces
- Proper prop typing for all components
- Clear documentation of data structures

## 📦 Key Components

### Events System
The events system demonstrates the modular architecture:

- **`WeekNavigator`**: Handles week navigation UI
- **`WeekCalendar`**: Displays week view with event indicators  
- **`EventsList`**: Renders scrollable list of events
- **`useEvents`**: Custom hook for events logic

### Benefits of This Structure

1. **Maintainability**: Changes to one component don't affect others
2. **Testability**: Each component can be tested in isolation
3. **Reusability**: Components can be used in different contexts
4. **Readability**: Clear component names and documentation
5. **Collaboration**: Multiple developers can work on different components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- React Native development environment

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

## 🤝 Contributing

### Code Style Guidelines

1. **Component Structure**
   ```tsx
   // ✅ Good: Single responsibility, clear props
   interface ComponentProps {
     data: DataType;
     onAction: (data: DataType) => void;
   }
   
   export default function Component({ data, onAction }: ComponentProps) {
     // Component logic
   }
   ```

2. **Custom Hooks**
   ```tsx
   // ✅ Good: Extract business logic
   export function useCustomHook(param: ParamType) {
     // Hook logic
     return { data, actions };
   }
   ```

3. **Constants**
   ```tsx
   // ✅ Good: Centralized, typed constants
   export const ANIMATION_CONFIG = {
     SPRING: { damping: 15, stiffness: 120 },
   } as const;
   ```

### Adding New Features

1. **Create focused components** for new UI elements
2. **Extract business logic** into custom hooks
3. **Add constants** for configuration values
4. **Update types** for new data structures
5. **Document** your components and hooks

### Testing

Each component should be testable in isolation. Consider:
- Unit tests for business logic
- Component tests for UI behavior
- Integration tests for user flows

## 📚 Documentation

- Component documentation in `app/components/*/README.md`
- Type definitions in `lib/types.ts`
- Constants documentation in `lib/constants.ts`

## 🔧 Configuration

Key configuration files:
- `lib/constants.ts` - App-wide constants
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration

## 📄 License

[Add your license here]

---

Built with ❤️ for the Muslim community

