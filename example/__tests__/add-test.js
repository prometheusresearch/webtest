describe('addition', function() {

  it('sums numbers', function() {
    expect(1 + 1).toBe(2);
  });

  it('multiplies numbers', function() {
    expect(2 + 3).toBe(6);
  });

  it('fails', function() {
    throwsError();
  });

});

describe('failure', function() {
  throw new Error('oops');
});

function throwsError() {
  throw new Error('x');
}