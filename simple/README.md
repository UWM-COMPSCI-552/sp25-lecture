# Simple Shape Editor

## Refactorings

### Convert Public Method to Functional Field

A public method is converted into a puyblic readonly field of 
functional type.  This field is assigned in the constructor to
the function value of the method.

### Convert Private Method to Anonymous Function

A private method used only in the constructor is converted into
a const functional value in the constructor.  All uses of the method (in the constructor) are changed to use this const.  So `this.privateMethod(args)` becomes `privateMethod(args)`.
