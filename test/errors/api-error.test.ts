import { HttpClient } from '../../src/http/http-client';
import { SipagoApiError } from '../../src/errors/api-error';

describe('SipagoApiError', () => {
  it('includes status and body from failed responses', async () => {
    const fetchMock = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ errors: [{ detail: 'Not found' }] }), { status: 404 }),
      ),
    ) as typeof fetch;

    const http = new HttpClient(fetchMock, 5000);

    try {
      await http.request('https://api.example.com/test');
      fail('Expected request to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(SipagoApiError);
      expect((error as SipagoApiError).status).toBe(404);
      expect((error as SipagoApiError).body).toEqual({ errors: [{ detail: 'Not found' }] });
    }
  });

  it('throws timeout error on abort', async () => {
    const fetchMock = jest.fn((_input, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    }) as typeof fetch;

    const http = new HttpClient(fetchMock, 10);

    await expect(http.request('https://api.example.com/slow')).rejects.toMatchObject({
      name: 'SipagoApiError',
      status: 408,
    });
  });
});
