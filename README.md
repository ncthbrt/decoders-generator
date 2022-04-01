# decoder-generator

Takes in a typescript file and generates a set of decoders based on the types
contained therein.

## Installlation

```bash
npm install -g decoders-generator
```

## Usage

### Basic usage

```bash
cat ./input-file.ts | decoders-generator > outfile.ts
```

### Support for tagged unions

```bash
cat ./input-file.ts | decoders-generator --tag=kind > outfile.ts
```
