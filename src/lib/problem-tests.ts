// Per-problem test cases. Each `call` is a Python expression that invokes
// the user-defined function. Either `expected` (a Python expression compared
// to the result with np.allclose) or `check` (a boolean Python expression
// referencing `result`) must be provided.

export type TestCase = {
  name: string;
  call: string;
  expected?: string;
  check?: string;
  tol?: number;
};

export type ProblemTests = {
  fn: string;
  cases: TestCase[];
};

export const PROBLEM_TESTS: Record<string, ProblemTests> = {
  softmax: {
    fn: "softmax",
    cases: [
      {
        name: "basic [1,2,3]",
        call: "softmax(np.array([1.0, 2.0, 3.0]))",
        expected: "np.array([0.09003057, 0.24472847, 0.66524096])",
      },
      {
        name: "numerical stability (large logits)",
        call: "softmax(np.array([1000.0, 1001.0, 1002.0]))",
        expected: "np.array([0.09003057, 0.24472847, 0.66524096])",
      },
      {
        name: "uniform",
        call: "softmax(np.array([0.0, 0.0, 0.0, 0.0]))",
        expected: "np.array([0.25, 0.25, 0.25, 0.25])",
      },
      {
        name: "sums to 1",
        call: "softmax(np.array([-2.0, 0.5, 3.1, 1.0]))",
        check: "abs(float(result.sum()) - 1.0) < 1e-6",
      },
    ],
  },

  "mse-loss": {
    fn: "mse",
    cases: [
      { name: "perfect prediction", call: "mse(np.array([1.0,2.0,3.0]), np.array([1.0,2.0,3.0]))", expected: "0.0" },
      { name: "off by one", call: "mse(np.array([1.0,2.0,3.0]), np.array([1.0,2.0,4.0]))", expected: "1.0/3.0" },
      { name: "negative residuals", call: "mse(np.array([0.0,0.0,0.0]), np.array([1.0,-1.0,2.0]))", expected: "(1+1+4)/3.0" },
    ],
  },

  attention: {
    fn: "attention",
    cases: [
      {
        name: "1 query, 2 keys",
        call: "attention(np.array([[1.0,0.0]]), np.array([[1.0,0.0],[0.0,1.0]]), np.array([[1.0,2.0],[3.0,4.0]]))",
        expected: "np.array([[1.66001197, 2.66001197]])",
        tol: 1e-4,
      },
      {
        name: "identity values returns weighted softmax",
        call: "attention(np.eye(3), np.eye(3), np.eye(3))",
        check: "result.shape == (3,3) and np.allclose(result.sum(axis=1), 1.0, atol=1e-6)",
      },
    ],
  },

  "sigmoid-and-derivative": {
    fn: "sigmoid_and_grad",
    cases: [
      {
        name: "zero input",
        call: "sigmoid_and_grad(np.array([0.0]))",
        check: "np.allclose(result[0], 0.5) and np.allclose(result[1], 0.25)",
      },
      {
        name: "vector input",
        call: "sigmoid_and_grad(np.array([-2.0, 0.0, 2.0]))",
        check: "np.allclose(result[0], 1/(1+np.exp(-np.array([-2.0,0.0,2.0])))) and np.allclose(result[1], result[0]*(1-result[0]))",
      },
      {
        name: "grad equals s*(1-s)",
        call: "sigmoid_and_grad(np.array([1.5]))",
        check: "abs(float(result[1]) - float(result[0]*(1-result[0]))) < 1e-8",
      },
    ],
  },

  "cross-entropy-loss": {
    fn: "cross_entropy",
    cases: [
      {
        name: "confident correct",
        call: "cross_entropy(np.array([[0.7,0.2,0.1]]), np.array([0]))",
        expected: "float(-np.log(0.7))",
      },
      {
        name: "batch of two",
        call: "cross_entropy(np.array([[0.7,0.2,0.1],[0.1,0.8,0.1]]), np.array([0,1]))",
        expected: "float((-np.log(0.7) - np.log(0.8))/2)",
      },
      {
        name: "perfect predictions ~ 0",
        call: "cross_entropy(np.array([[0.999,0.0005,0.0005]]), np.array([0]))",
        check: "float(result) < 1e-2",
      },
    ],
  },

  "layer-norm": {
    fn: "layer_norm",
    cases: [
      {
        name: "zero mean, unit var after norm (gamma=1, beta=0)",
        call: "layer_norm(np.array([[1.0,2.0,3.0,4.0]]), np.ones(4), np.zeros(4))",
        check: "abs(float(result.mean())) < 1e-5 and abs(float(result.std()) - 1.0) < 1e-3",
      },
      {
        name: "gamma & beta applied",
        call: "layer_norm(np.array([[1.0,2.0,3.0,4.0]]), np.array([2.0,2.0,2.0,2.0]), np.array([1.0,1.0,1.0,1.0]))",
        check: "abs(float(result.mean()) - 1.0) < 1e-5",
      },
    ],
  },

  "kl-divergence": {
    fn: "kl_div",
    cases: [
      {
        name: "identical distributions => 0",
        call: "kl_div(np.array([0.5,0.5]), np.array([0.5,0.5]))",
        check: "abs(float(result)) < 1e-8",
      },
      {
        name: "p=[0.5,0.5], q=[0.25,0.75]",
        call: "kl_div(np.array([0.5,0.5]), np.array([0.25,0.75]))",
        expected: "float(0.5*np.log(0.5/0.25) + 0.5*np.log(0.5/0.75))",
      },
      {
        name: "non-negative",
        call: "kl_div(np.array([0.1,0.9]), np.array([0.4,0.6]))",
        check: "float(result) >= 0",
      },
    ],
  },

  "kmeans-update": {
    fn: "kmeans_step",
    cases: [
      {
        name: "two clear clusters",
        call: "kmeans_step(np.array([[0.0,0.0],[0.1,0.0],[10.0,10.0],[10.1,10.0]]), np.array([[0.0,0.0],[10.0,10.0]]))",
        check: "list(result[0]) == [0,0,1,1] and np.allclose(result[1], np.array([[0.05,0.0],[10.05,10.0]]))",
      },
      {
        name: "labels length matches data",
        call: "kmeans_step(np.random.default_rng(0).normal(size=(20,3)), np.random.default_rng(1).normal(size=(4,3)))",
        check: "len(result[0]) == 20 and result[1].shape == (4,3)",
      },
    ],
  },

  "positional-encoding": {
    fn: "positional_encoding",
    cases: [
      {
        name: "shape (10, 16)",
        call: "positional_encoding(10, 16)",
        check: "result.shape == (10, 16)",
      },
      {
        name: "row 0 alternates sin(0)/cos(0)",
        call: "positional_encoding(4, 8)",
        check: "np.allclose(result[0, 0::2], 0.0) and np.allclose(result[0, 1::2], 1.0)",
      },
      {
        name: "values bounded in [-1, 1]",
        call: "positional_encoding(20, 32)",
        check: "float(result.max()) <= 1.0 + 1e-9 and float(result.min()) >= -1.0 - 1e-9",
      },
    ],
  },

  "topk-sampling": {
    fn: "top_k_sample",
    cases: [
      {
        name: "result is one of the top-2 indices",
        call: "top_k_sample(np.array([1.0, 5.0, 2.0, 9.0, 3.0]), 2, np.random.default_rng(0))",
        check: "int(result) in (1, 3)",
      },
      {
        name: "k=1 returns argmax",
        call: "top_k_sample(np.array([0.1, 0.2, 9.9, 0.3]), 1, np.random.default_rng(42))",
        check: "int(result) == 2",
      },
      {
        name: "result is a valid index",
        call: "top_k_sample(np.array([1.0,2.0,3.0,4.0,5.0,6.0]), 3, np.random.default_rng(7))",
        check: "0 <= int(result) < 6",
      },
    ],
  },
};
