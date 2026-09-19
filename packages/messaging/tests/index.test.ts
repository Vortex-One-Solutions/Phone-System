[Reading 7 lines from start (total: 7 lines, 0 remaining)]

import { describe, expect, it } from 'vitest';
import { assertMessageTransition, normalizePhone, validateTemplateVariables } from '../src/index.js';
describe('messaging',()=>{
 it('enforces monotonic delivery states',()=>{ expect(()=>assertMessageTransition('DELIVERED','SENT')).toThrow(); });
 it('normalizes E164',()=>expect(normalizePhone('+14155552671')).toBe('+14155552671'));
 it('validates template variables',()=>expect(()=>validateTemplateVariables('Hi {{name}}',['name'],{})).toThrow());
});

