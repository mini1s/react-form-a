# FormA

A reusable form component.

## Functionality

- Forms can have many sections.
- Fields can have custom functions to determine whether they appear.
- Fields can have custom validators.
- There are many field types: `input:text`, `input:date`, `boolean`, etc.
- There are some custom components: `FileUpload`, `MoneyTable`.
- Nested data structures are handled with pathSegment props on components.
- There is a `FormList` component that can handle forms in mutable arrays.

## Notes

The built in hooks e.g. `useSections` use a firestore doc strucure like this:

```ts
interface Doc {
  form: Record<string, any>
  completeSections: Record<string, boolean>
  submitted?: boolean  
}
```

## Screenshots

![Screenshot 1](https://cdn.usq.re/jack/forma2.png)
![Screenshot 2](https://cdn.usq.re/jack/forma1.png)
![Screenshot 3](https://cdn.usq.re/jack/forma3.png)
![Screenshot 4](https://cdn.usq.re/jack/forma4.png)
