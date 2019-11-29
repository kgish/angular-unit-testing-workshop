import { CapitalizeWordsPipe } from './capitalize-words.pipe';

describe('CapitalizeWordsPipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return an empty string if null is passed', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe.transform(null)).toBe('');
  });

  it('should return an empty string if empty string is passed', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe.transform('')).toBe('');
  });

  it('should return captialized word if single word is passed', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe.transform('hello')).toBe('Hello');
  });

  it('should return captialized words if multiple words are passed', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe.transform('hello goodbye tomorrow')).toBe('Hello Goodbye Tomorrow');
  });

  it('should return captialized word if word with all capitals is passed', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe.transform('hELLO')).toBe('Hello');
  });

  it('should return same word if word with all digits is passed', () => {
    const pipe = new CapitalizeWordsPipe();
    expect(pipe.transform('1234567890')).toBe('1234567890');
  });
});
