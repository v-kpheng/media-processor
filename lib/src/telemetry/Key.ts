// Add here any new key value. Keys for the dictionary follow a pattern: <who_action>_<key>.

export class Key {
  static updates: { [key: string]: string } = {
    'transformer_new': 'New transformer',
    'transformer_null': 'Null transformer'
  };
  static errors: { [key: string]: string } = {
    'transformer_none': 'No transformers provided',
    'transformer_start': 'Cannot start transformer',
    'transformer_transform': 'Cannot transform frame',
    'transformer_flush': 'Cannot flush transformer',
    'readable_null': 'Readable is null',
    'writable_null': 'Writable is null',
  };
}
