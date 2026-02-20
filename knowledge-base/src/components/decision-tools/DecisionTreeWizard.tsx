import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowBack, ArrowForward, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DecisionTree, DecisionNode } from '../../types';

interface DecisionTreeWizardProps {
  tree: DecisionTree;
}

export default function DecisionTreeWizard({ tree }: DecisionTreeWizardProps) {
  const [history, setHistory] = useState<string[]>([tree.nodes[0]?.id]);
  const navigate = useNavigate();

  const nodeMap = useMemo(() => {
    const map = new Map<string, DecisionNode>();
    tree.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [tree]);

  const currentNodeId = history[history.length - 1];
  const currentNode = nodeMap.get(currentNodeId);

  const handleSelect = (nextNodeId: string) => {
    setHistory(prev => [...prev, nextNodeId]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setHistory([tree.nodes[0]?.id]);
  };

  if (!currentNode) {
    return <Typography color="error">Decision tree configuration error.</Typography>;
  }

  const isRecommendation = !!currentNode.recommendation;

  return (
    <Box>
      {/* Progress stepper */}
      <Stepper activeStep={history.length - 1} alternativeLabel sx={{ mb: 4 }}>
        {history.map((nodeId, i) => {
          const node = nodeMap.get(nodeId);
          return (
            <Step key={i} completed={i < history.length - 1}>
              <StepLabel>
                {node?.question ? `Step ${i + 1}` : 'Result'}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Current question or recommendation */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {isRecommendation ? (
            <Box sx={{ textAlign: 'center' }}>
              <Chip label="Recommendation" color="success" sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {currentNode.recommendation}
              </Typography>
              {currentNode.articleId && (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/article/${currentNode.articleId}`)}
                >
                  Learn More
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                {currentNode.question}
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                {currentNode.options?.map(option => (
                  <Paper
                    key={option.nextNodeId}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                      transition: 'all 0.2s',
                    }}
                    onClick={() => handleSelect(option.nextNodeId)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight={500}>
                        {option.label}
                      </Typography>
                      <ArrowForward fontSize="small" color="action" />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={history.length <= 1}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          startIcon={<Refresh />}
          onClick={handleReset}
          variant="outlined"
          color="secondary"
        >
          Start Over
        </Button>
      </Stack>
    </Box>
  );
}
