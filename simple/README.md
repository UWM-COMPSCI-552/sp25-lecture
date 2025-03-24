# Simple Shape Editor

## Refactorings

### Convert Public Method to Functional Field

A public method is converted into a puyblic readonly field of 
functional type.  This field is assigned in the constructor to
the function value of the method.