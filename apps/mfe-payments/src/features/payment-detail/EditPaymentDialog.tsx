import { payflowApi, type Payment } from '@payflow/api-client';
import { Button, ErrorState, Modal, TextField, toast } from '@payflow/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { errorMessage } from '../../shared/payment';
import { usePaymentChanged } from '../../shared/queries';

const ORDER_KEY = 'order_id';

// PATCH /payments/{id}: só descrição e metadados mudam; valor e método nunca.
export function EditPaymentDialog({ payment, onClose }: { readonly payment: Payment; readonly onClose: () => void }) {
  const [description, setDescription] = useState(payment.description ?? '');
  const [order, setOrder] = useState(payment.metadata[ORDER_KEY] ?? '');
  const changed = usePaymentChanged();

  const save = useMutation({
    mutationFn: () => {
      const metadata = { ...payment.metadata };
      if (order.trim()) {
        metadata[ORDER_KEY] = order.trim();
      } else {
        delete metadata[ORDER_KEY];
      }
      return payflowApi.updatePayment(payment.id, { description: description.trim(), metadata });
    },
    onSuccess: (updated) => {
      changed(updated);
      toast('Pagamento atualizado');
      onClose();
    },
  });

  return (
    <Modal
      title="Editar pagamento"
      onClose={onClose}
      actions={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>Voltar</Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>Salvar</Button>
        </>
      )}
    >
      {save.isError ? <ErrorState title="Não foi possível salvar" detail={errorMessage(save.error)} /> : null}
      <TextField
        id="edit-description"
        label="Descrição"
        maxLength={255}
        value={description}
        help="Aparece na lista de pagamentos e no webhook."
        onChange={(event) => setDescription(event.target.value)}
      />
      <TextField
        id="edit-order"
        label="Número do pedido na sua loja"
        value={order}
        help={`Guardado nos metadados como ${ORDER_KEY}.`}
        onChange={(event) => setOrder(event.target.value)}
      />
    </Modal>
  );
}
