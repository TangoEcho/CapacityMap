import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Toolbar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActionArea,
  Grid,
} from '@mui/material';
import { DecisionTree } from '../../types';
import { decisionTreesApi } from '../../services/api-adapter';
import DecisionTreeWizard from './DecisionTreeWizard';
import ComparisonMatrix from './ComparisonMatrix';
import Breadcrumbs from '../common/Breadcrumbs';

export default function DecisionToolsPage() {
  const [trees, setTrees] = useState<DecisionTree[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTree, setSelectedTree] = useState<DecisionTree | null>(null);

  useEffect(() => {
    decisionTreesApi.getAll().then(setTrees);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar />
      <Breadcrumbs items={[{ label: 'Decision Tools' }]} />

      <Typography variant="h4" gutterBottom>Decision Tools</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Interactive tools to help you choose the right trade finance product and assess risk.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => { setActiveTab(v); setSelectedTree(null); }}
        sx={{ mb: 3 }}
      >
        <Tab label="Product Selector" />
        <Tab label="Comparison Matrix" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {!selectedTree ? (
            <Grid container spacing={2}>
              {trees.map(tree => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tree.id}>
                  <Card>
                    <CardActionArea onClick={() => setSelectedTree(tree)}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          {tree.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tree.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer', mb: 2 }}
                onClick={() => setSelectedTree(null)}
              >
                &larr; Back to all tools
              </Typography>
              <DecisionTreeWizard tree={selectedTree} />
            </Box>
          )}
        </>
      )}

      {activeTab === 1 && <ComparisonMatrix />}
    </Box>
  );
}
