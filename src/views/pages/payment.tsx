import { FC, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Box, Button, FormGroup, FormLabel, Paper, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";

import { usePaymentContext } from "../../context/paymentContext";
import { useThemeContext } from "../../context/themeContext";
import CircularLoading from "../loading/circular";
import Layout from "../layout/layout";
import Text from "../text/text";
import { PAYMENT_SERVER_URL } from "../../constants/urls";

const Payment: FC = () => {
  const intl = useIntl();
  const { state } = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent, isPaymentIntentLoading } = usePaymentContext();
  const { heavyFont, regularFont, theme } = useThemeContext();
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);

  const handleSubmitPayment = async () => {
    console.log("Submitting payment...");
    if (!stripe || !elements) return;

    setIsPaymentLoading(true);

    const clientSecret = await createPaymentIntent(state.packageId);
    console.log("Confirming card payment...");
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
    console.log("Payment confirmed!");

    setIsPaymentLoading(false);

    if (error) {
      console.error("Payment failed: ", error); // TODO: localize
    } else {
      console.log("Payment succeeded!"); // TODO: localize and add snackbar
      navigate("/profile");
    }
  };

  return (
    <Layout title={intl.formatMessage({ id: "payment_title" })}>
      <Box>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <Text variant="h4" fontFamily={heavyFont}>
            {intl.formatMessage({ id: "payment_secureCheckout" })}
          </Text>
          <Box sx={{ flexGrow: 1 }} />
          <Text variant="body1" fontFamily={regularFont}>
            <em>
              {intl.formatMessage({ id: "payment_poweredBy" })}{" "}
              <strong>Stripe</strong>
            </em>
          </Text>
        </Box>
        <FormGroup onSubmit={handleSubmitPayment}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <FormLabel>
                    <Text variant="h6" fontFamily={heavyFont}>
                      {intl.formatMessage({ id: "payment_selectedPackage" })}:
                    </Text>
                  </FormLabel>
                  <Text variant="body1" fontFamily={regularFont}>
                    {state.packageLabel}
                  </Text>
                </Box>
                <Box>
                  <FormLabel>
                    <Text variant="h6" fontFamily={heavyFont}>
                      {intl.formatMessage({ id: "payment_lessonCost" })}:
                    </Text>
                  </FormLabel>
                  <Text variant="body1" fontFamily={regularFont}>
                    {state.lessonPrice}
                  </Text>
                </Box>
                <Box>
                  <FormLabel>
                    <Text variant="h6" fontFamily={heavyFont}>
                      {intl.formatMessage({ id: "payment_totalCost" })}:
                    </Text>
                  </FormLabel>
                  <Text variant="body1" fontFamily={regularFont}>
                    ${state.packagePrice}
                  </Text>
                </Box>
                <Box>
                  <FormLabel>
                    <Text variant="h6" fontFamily={heavyFont}>
                      {intl.formatMessage({ id: "payment_cardDetails" })}:
                    </Text>
                  </FormLabel>
                  <CardElement />
                </Box>
              </Stack>
            </Paper>
            <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/profile")}
                color="secondary"
                sx={{ mr: 2 }}
              >
                <Text variant="button" fontFamily={heavyFont}>
                  {intl.formatMessage({ id: "common_cancel" })}
                </Text>
              </Button>
              <Button
                type="button"
                variant="contained"
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={handleSubmitPayment}
              >
                <Text variant="button" fontFamily={heavyFont}>
                  {isPaymentLoading || isPaymentIntentLoading
                    ? intl.formatMessage({ id: "payment_processing" })
                    : intl.formatMessage({ id: "payment_submitPayment" })}
                </Text>
                {(isPaymentLoading || isPaymentIntentLoading) && (
                  <CircularLoading />
                )}
              </Button>
            </Box>
          </Stack>
        </FormGroup>
      </Box>
    </Layout>
  );
};

export default Payment;
