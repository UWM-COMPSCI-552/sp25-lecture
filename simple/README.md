# Simple Shape Editor

## Refactorings

### Convert Public Method to Functional Field

A public method is converted into a puyblic readonly field of 
functional type.  This field is assigned in the constructor to
the function value of the method.

### Convert Private Method to Anonymous Function

A private method used only in the constructor is converted into
a const functional value in the constructor.  All uses of the method (in the constructor) are changed to use this const.  So `this.privateMethod(args)` becomes `privateMethod(args)`.

### Convert Private Method to Module Function

A method that6 doesn't access the instance in any way can be made
a function at the top-level.  It has no dependency on the class state.

### Convert Constant Field to Global

A readonly field assigned at its declaration not using `this` can be
converted into a global.

### Convert mutable field to let in constructor

Once the class has no methods, we can inline mutable fields as
let variables.

### Convert readonly field to `const` in constructor

Like the last one but `const`.