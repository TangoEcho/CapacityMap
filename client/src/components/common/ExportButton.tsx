import { useState, useRef } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Download, Image, PictureAsPdf, Slideshow } from '@mui/icons-material';
import { useExport } from '../../hooks/useExport';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename: string;
  showPdf?: boolean;
}

export default function ExportButton({ targetRef, filename, showPdf }: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { exportPng, exportSvg, exportPdf } = useExport();

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    setAnchorEl(null);
    if (!targetRef.current) return;
    switch (format) {
      case 'png': await exportPng(targetRef.current, filename); break;
      case 'svg': exportSvg(targetRef.current, filename); break;
      case 'pdf': await exportPdf(targetRef.current, filename); break;
    }
  };

  return (
    <>
      <Tooltip title="Export">
        <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
          <Download fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport('png')}>
          <ListItemIcon><Image fontSize="small" /></ListItemIcon>
          <ListItemText>Export PNG</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('svg')}>
          <ListItemIcon><Image fontSize="small" /></ListItemIcon>
          <ListItemText>Export SVG</ListItemText>
        </MenuItem>
        {showPdf && (
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon><PictureAsPdf fontSize="small" /></ListItemIcon>
            <ListItemText>Export PDF</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
