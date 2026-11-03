import React, { useEffect } from 'react';

export type InfoType = 'guide' | 'notice';

interface InfoDialogProps {
  type: InfoType | null;
  onClose: () => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ type, onClose }) => {
  useEffect(() => {
    if (!type) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  if (!type) return null;

  const isGuide = type === 'guide';
  const title = isGuide ? 'Como Usar o POSE Atlas 3D' : 'Termos de Uso e Licença';

  return (
    <div
      className="info-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="info-dialog" role="dialog" aria-modal="true" aria-labelledby="infoTitle">
        <div className="info-head">
          <h2 id="infoTitle">{title}</h2>
          <button
            className="info-close"
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="info-content">
          {isGuide ? (
            <ul>
              <li>
                <strong>Biblioteca de Poses:</strong> Navegue pelas poses 2D na coluna esquerda.
                Você pode filtrar por categoria (em pé, sentado, agachado, etc.), série ou ângulo de câmera.
              </li>
              <li>
                <strong>Aplicação Automática no Modelo 3D:</strong> Ao clicar em qualquer pose ou no botão{' '}
                <em>&ldquo;Aplicar&rdquo;</em>, o aplicativo estima e calcula as rotações articulares correspondentes (cabeça, tórax, braços, cotovelos, quadril, pernas e joelhos) e as aplica suavemente ao modelo 3D.
              </li>
              <li>
                <strong>Upload de Modelo Próprio (.GLB):</strong> Arraste e solte ou clique em{' '}
                <em>&ldquo;Subir Modelo .GLB&rdquo;</em> para carregar seu próprio personagem 3D com esqueleto (compatível com Mixamo, Blender Rigify, VRM ou esqueletos padrão).
              </li>
              <li>
                <strong>Controle Manual & Gizmo 3D:</strong> Selecione qualquer osso no painel direito ou ative o{' '}
                <em>&ldquo;Gizmo 3D&rdquo;</em> para rotacionar as articulações interativamente no espaço 3D.
              </li>
              <li>
                <strong>Exportação:</strong> Quando estiver satisfeito com a pose, clique em{' '}
                <em>&ldquo;Exportar .GLB&rdquo;</em> para baixar o arquivo 3D com a pose congelada.
              </li>
            </ul>
          ) : (
            <>
              <ul>
                <li>
                  As imagens de referência e poses originais são de autoria de <strong>ギア (@giaaibusi)</strong>{' '}
                  e compiladas pelo repositório comunitário de <strong>Anhao</strong>.
                </li>
                <li>
                  O uso para referência de desenho, arte e geração com IA é livre para fins pessoais e comerciais.
                </li>
                <li>
                  É proibida a revenda isolada do banco de dados de imagens sem modificação.
                </li>
                <li>
                  Todo o processamento de Three.js e retargeting é executado 100% no navegador do usuário,
                  sem envio de modelos ou dados para servidores externos.
                </li>
              </ul>
              <div className="info-note">
                Dica: Para melhores resultados com modelos próprios, certifique-se de que o modelo exportado em .glb contenha skinned meshes ou armature com ossos nomeados.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
