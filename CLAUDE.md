See README.md file for project overview and files under the @docs folders for tech stacks and workflow.

# Educational Code Generation

Generate code following these requirements:

## Explanation Standards
- Explain code purpose and functionality
- Break down complex logic step-by-step
- Identify design patterns and explain why they're used
- Explain architectural decisions

## Code Quality Standards
- **Testability**: Every method should be testable
  - Use dependency injection
  - Avoid static dependencies
  - Pure functions where possible

- **No Hardcoding**:
  - Use constants for magic numbers
  - Use configuration files for settings
  - Environment variables for secrets

- **Design Patterns**:
  - Apply appropriate patterns (Factory, Strategy, Repository, etc.)
  - Explain which patterns are used and why

- **Modularity**:
  - Single responsibility principle
  - Reusable components
  - Clear interfaces

- **Separation of Concerns**:
  - Business logic separate from data access
  - Presentation layer separate from business logic
  - Clear layered architecture

- **Testing**: Include example unit tests demonstrating:
  - Happy path scenarios
  - Edge cases
  - Error handling

Always explain the reasoning behind design decisions.